import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveDemoMode, validateBuildEnvironment } from '../src/config/environment.ts'

test('mock só é padrão no desenvolvimento', () => {
  assert.equal(resolveDemoMode({ DEV: true }), true)
  assert.equal(resolveDemoMode({}), false)
  assert.equal(resolveDemoMode({ DEV: true, VITE_DEMO_MODE: 'false' }), false)
})

test('valores ambíguos do modo demo falham explicitamente', () => {
  assert.throws(() => resolveDemoMode({ VITE_DEMO_MODE: 'yes' }))
})

test('build demo exige modo específico e não exige API', () => {
  assert.throws(() => validateBuildEnvironment({ VITE_DEMO_MODE: 'true' }, 'production'))
  assert.doesNotThrow(() => validateBuildEnvironment({ VITE_DEMO_MODE: 'true' }, 'demo'))
})

test('produção exige API válida e não aceita bypass de autenticação', () => {
  assert.throws(() => validateBuildEnvironment({}, 'production'))
  assert.throws(() => validateBuildEnvironment({ VITE_API_BASE_URL: '/api', VITE_DEV_ACCESS_TOKEN: 'secret' }, 'production'))
  assert.throws(() => validateBuildEnvironment({ VITE_DEMO_MODE: 'true', VITE_DEV_ACCESS_TOKEN: 'secret' }, 'demo'))
  for (const base of ['http://192.168.1.1/api', '//evil.example/api', '/api?key=value', '/api#fragment', 'invalid', 'https://user:password@api.example', 'https://api.example?key=value']) {
    assert.throws(() => validateBuildEnvironment({ VITE_API_BASE_URL: base }, 'production'), base)
  }
  for (const base of ['/api/v1', 'https://api.example/api/v1']) {
    assert.doesNotThrow(() => validateBuildEnvironment({ VITE_API_BASE_URL: base }, 'production'))
  }
})
