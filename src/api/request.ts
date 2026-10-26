export type ApiErrorBody = {
  code?: string
  message?: string
  details?: unknown
  detail?: string
  title?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message || body?.detail || body?.title || `Erro HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code || `HTTP_${status}`
    this.details = body?.details ?? null
  }
}

export type TokenProvider = () => string | null | Promise<string | null>
export type UnauthorizedHandler = () => Promise<boolean>
export type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
  formData?: FormData
  signal?: AbortSignal
}

type Transport = (path: string, options: RequestOptions) => Promise<unknown>

/** Uma renovação por sessão; só respostas 401 autorizam uma única repetição. */
export function createApiClient(transport: Transport) {
  let tokenProvider: TokenProvider = () => null
  let unauthorizedHandler: UnauthorizedHandler | null = null
  let recovery: Promise<boolean> | null = null
  let sessionEpoch = 0

  function setAccessTokenProvider(provider: TokenProvider) {
    tokenProvider = provider
  }

  function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
    unauthorizedHandler = handler
    if (!handler) invalidateSession()
  }

  /** Login/logout invalidam requests antigas; refresh preserva a mesma sessão. */
  function invalidateSession() {
    sessionEpoch += 1
    recovery = null
  }

  async function recover(failedToken: string, epoch: number): Promise<boolean> {
    if (epoch !== sessionEpoch) return false
    const currentToken = await tokenProvider()
    if (!currentToken) return false
    if (currentToken !== failedToken) return true
    if (!unauthorizedHandler) return false
    if (!recovery) {
      const handler = unauthorizedHandler
      const pending = Promise.resolve().then(handler).catch(() => false)
      recovery = pending
      void pending.finally(() => {
        if (recovery === pending) recovery = null
      })
    }
    const recovered = await recovery
    return recovered && epoch === sessionEpoch
  }

  async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const epoch = sessionEpoch
    const managedToken = options.token === undefined
    const token = managedToken ? await tokenProvider() : options.token
    options.signal?.throwIfAborted()
    if (managedToken && epoch !== sessionEpoch) throw new ApiError(401, { message: 'A sessão mudou.' })
    try {
      const result = await transport(path, { ...options, token: token ?? null })
      if (managedToken && epoch !== sessionEpoch) throw new ApiError(401, { message: 'A sessão mudou.' })
      return result as T
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401 || !managedToken || !token) throw err
      if (!await recover(token, epoch)) throw err
      options.signal?.throwIfAborted()
      const renewed = await tokenProvider()
      if (!renewed || epoch !== sessionEpoch) throw err
      // Não repete falhas de rede ou de negócio, apenas a rejeição da autenticação.
      const result = await transport(path, { ...options, token: renewed })
      if (epoch !== sessionEpoch) throw new ApiError(401, { message: 'A sessão mudou.' })
      return result as T
    }
  }

  return { apiRequest, setAccessTokenProvider, setUnauthorizedHandler, invalidateSession }
}

export function createHttpTransport(baseUrl: () => string, fetcher: typeof fetch = fetch): Transport {
  return async (path, options) => {
    const headers = new Headers()
    if (options.token) headers.set('Authorization', `Bearer ${options.token}`)
    let body: BodyInit | undefined
    if (options.formData) body = options.formData
    else if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(options.body)
    }
    const response = await fetcher(`${baseUrl().trim().replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`, {
      method: options.method ?? (options.body !== undefined || options.formData ? 'POST' : 'GET'),
      headers,
      body,
      signal: options.signal,
    })
    const text = await response.text()
    let parsed: unknown = text || null
    if (text) {
      try { parsed = JSON.parse(text) } catch { /* Preserva respostas de texto. */ }
    }
    if (!response.ok) {
      throw new ApiError(response.status, parsed && typeof parsed === 'object' ? parsed as ApiErrorBody : null)
    }
    return parsed
  }
}
