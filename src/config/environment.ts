export type Environment = {
  DEV?: boolean
  VITE_DEMO_MODE?: string
  VITE_API_BASE_URL?: string
  VITE_DEV_ACCESS_TOKEN?: string
}

/** Desenvolvimento usa mock; builds reais nunca o ativam por omissão. */
export function resolveDemoMode(env: Environment): boolean {
  const value = env.VITE_DEMO_MODE?.trim()
  if (value && value !== 'true' && value !== 'false') {
    throw new Error('VITE_DEMO_MODE deve ser true ou false.')
  }
  return value ? value === 'true' : env.DEV === true
}

export function validateBuildEnvironment(env: Environment, mode: string): void {
  if (env.VITE_DEV_ACCESS_TOKEN?.trim()) {
    throw new Error('Remova VITE_DEV_ACCESS_TOKEN antes de gerar um build.')
  }
  if (resolveDemoMode({ ...env, DEV: false })) {
    if (mode !== 'demo') {
      throw new Error('Demonstração exige npm run build:demo. Para produção, use VITE_DEMO_MODE=false.')
    }
    return
  }
  const base = env.VITE_API_BASE_URL?.trim()
  if (!base) throw new Error('Configure VITE_API_BASE_URL para o build de produção.')
  // Mesma origem permite proxy reverso sem URLs específicas de infraestrutura.
  if (base.startsWith('/') && !base.startsWith('//') && !/[\\?#\s]/.test(base)) return
  let url: URL
  try {
    url = new URL(base)
  } catch {
    throw new Error('VITE_API_BASE_URL deve ser uma URL HTTPS ou um caminho como /api/v1.')
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('A API de produção deve usar HTTPS, sem credenciais, query ou fragmento na URL.')
  }
}
