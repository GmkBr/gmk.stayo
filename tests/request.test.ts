import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError, createApiClient, createHttpTransport } from '../src/api/request.ts'

const unauthorized = () => new ApiError(401, { message: 'Expirado' })

test('requests concorrentes compartilham uma renovação e repetem com o token novo', async () => {
  let token = 'expired'
  let refreshes = 0
  const seen: string[] = []
  const gate = Promise.withResolvers<void>()
  const client = createApiClient(async (_, options) => {
    seen.push(options.token!)
    if (options.token === 'expired') throw unauthorized()
    return { ok: true }
  })
  client.setAccessTokenProvider(() => token)
  client.setUnauthorizedHandler(async () => {
    refreshes += 1
    await gate.promise
    token = 'renewed'
    return true
  })
  const requests = [client.apiRequest('/me'), client.apiRequest('/hotels')]
  await new Promise((resolve) => setImmediate(resolve))
  gate.resolve()
  assert.deepEqual(await Promise.all(requests), [{ ok: true }, { ok: true }])
  assert.equal(refreshes, 1)
  assert.deepEqual(seen, ['expired', 'expired', 'renewed', 'renewed'])
})

test('um 401 atrasado usa a sessão já renovada sem renovar novamente', async () => {
  let token = 'expired'
  let refreshes = 0
  const delayed = Promise.withResolvers<void>()
  const client = createApiClient(async (path, options) => {
    if (options.token === 'expired') {
      if (path === '/delayed') await delayed.promise
      throw unauthorized()
    }
    return 'ok'
  })
  client.setAccessTokenProvider(() => token)
  client.setUnauthorizedHandler(async () => { refreshes += 1; token = 'new'; return true })
  const slow = client.apiRequest('/delayed')
  assert.equal(await client.apiRequest('/fast'), 'ok')
  delayed.resolve()
  assert.equal(await slow, 'ok')
  assert.equal(refreshes, 1)
})

test('falha de renovação retorna 401 sem repetir a operação', async () => {
  let calls = 0
  const client = createApiClient(async () => { calls += 1; throw unauthorized() })
  client.setAccessTokenProvider(() => 'expired')
  client.setUnauthorizedHandler(async () => false)
  await assert.rejects(client.apiRequest('/orders', { method: 'POST', body: {} }), { status: 401 })
  assert.equal(calls, 1)
})

test('handler que lança erro não cria rejeição sem tratamento nem loop', async () => {
  const client = createApiClient(async () => { throw unauthorized() })
  client.setAccessTokenProvider(() => 'expired')
  client.setUnauthorizedHandler(async () => { throw new Error('offline') })
  await assert.rejects(client.apiRequest('/me'), { status: 401 })
})

test('login público e tokens explícitos não acionam renovação da sessão', async () => {
  let refreshes = 0
  const client = createApiClient(async () => { throw unauthorized() })
  client.setAccessTokenProvider(() => 'expired')
  client.setUnauthorizedHandler(async () => { refreshes += 1; return true })
  await assert.rejects(client.apiRequest('/auth/login', { token: null }), { status: 401 })
  await assert.rejects(client.apiRequest('/catalog', { token: 'device-token' }), { status: 401 })
  assert.equal(refreshes, 0)
})

test('um segundo 401 termina a tentativa sem loop de refresh', async () => {
  let calls = 0
  let refreshes = 0
  const client = createApiClient(async () => { calls += 1; throw unauthorized() })
  client.setAccessTokenProvider(() => 'token')
  client.setUnauthorizedHandler(async () => { refreshes += 1; return true })
  await assert.rejects(client.apiRequest('/me'), { status: 401 })
  assert.equal(calls, 2)
  assert.equal(refreshes, 1)
})

test('falha de rede em uma mutação não é repetida automaticamente', async () => {
  let calls = 0
  const client = createApiClient(async () => { calls += 1; throw new TypeError('Network error') })
  await assert.rejects(client.apiRequest('/checkout/complete', { method: 'POST', body: {} }), TypeError)
  assert.equal(calls, 1)
})

test('logout durante renovação impede replay da request anterior', async () => {
  let calls = 0
  const gate = Promise.withResolvers<boolean>()
  const started = Promise.withResolvers<void>()
  const client = createApiClient(async () => { calls += 1; throw unauthorized() })
  client.setAccessTokenProvider(() => 'old-session')
  client.setUnauthorizedHandler(() => { started.resolve(); return gate.promise })
  const request = client.apiRequest('/private')
  const rejected = assert.rejects(request, { status: 401 })
  await started.promise
  client.invalidateSession()
  client.setAccessTokenProvider(() => 'different-account')
  gate.resolve(true)
  await rejected
  assert.equal(calls, 1)
})

test('cancelamento durante renovação impede repetição da request', async () => {
  let calls = 0
  const controller = new AbortController()
  const client = createApiClient(async () => { calls += 1; throw unauthorized() })
  client.setAccessTokenProvider(() => 'expired')
  client.setUnauthorizedHandler(async () => { controller.abort(); return true })
  await assert.rejects(client.apiRequest('/me', { signal: controller.signal }), { name: 'AbortError' })
  assert.equal(calls, 1)
})

test('resposta de sucesso da conta anterior é descartada após logout', async () => {
  const response = Promise.withResolvers<unknown>()
  const started = Promise.withResolvers<void>()
  const client = createApiClient(() => { started.resolve(); return response.promise })
  client.setAccessTokenProvider(() => 'old-account')
  const rejected = assert.rejects(client.apiRequest('/reservations'), { status: 401 })
  await started.promise
  client.invalidateSession()
  response.resolve({ privateGuestData: 'old-account-data' })
  await rejected
})

test('HTTP preserva método, JSON, token e signal; aceita resposta sem conteúdo', async () => {
  const controller = new AbortController()
  const transport = createHttpTransport(() => 'https://api.example/api/v1/', async (url, init) => {
    assert.equal(url, 'https://api.example/api/v1/orders')
    assert.equal(init?.method, 'POST')
    assert.equal(init?.body, '{"qty":2}')
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer token')
    assert.equal(new Headers(init?.headers).get('Content-Type'), 'application/json')
    assert.equal(init?.signal, controller.signal)
    return new Response(null, { status: 204 })
  })
  assert.equal(await transport('/orders', { method: 'POST', body: { qty: 2 }, token: 'token', signal: controller.signal }), null)
})

test('erros Problem Details mantêm status e mensagem do backend', async () => {
  const transport = createHttpTransport(() => '/api', async () => new Response(
    JSON.stringify({ detail: 'Quarto indisponível', code: 'ROOM_BUSY' }), { status: 409 },
  ))
  await assert.rejects(transport('/checkin', {}), { status: 409, message: 'Quarto indisponível', code: 'ROOM_BUSY' })
})
