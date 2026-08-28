export type ApiErrorBody = {
  code?: string
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message || `Erro HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code || `HTTP_${status}`
    this.details = body?.details ?? null
  }
}

export type TokenProvider = () => string | null | Promise<string | null>
export type UnauthorizedHandler = () => void

let tokenProvider: TokenProvider = () => null
let unauthorizedHandler: UnauthorizedHandler | null = null

export function setAccessTokenProvider(provider: TokenProvider) {
  tokenProvider = provider
}

/** Chamado em 401 quando a request usou o JWT do console (não token explícito de totem). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler
}

function baseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!raw?.trim()) throw new Error('VITE_API_BASE_URL não configurada')
  return raw.replace(/\/$/, '')
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
  formData?: FormData
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers()
  const usedConsoleToken = options.token === undefined
  const token = usedConsoleToken ? await tokenProvider() : options.token
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let body: BodyInit | undefined
  if (options.formData) {
    body = options.formData
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const res = await fetch(`${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    method: options.method ?? (options.body || options.formData ? 'POST' : 'GET'),
    headers,
    body,
    signal: options.signal,
  })

  const parsed = await parseBody(res)
  if (!res.ok) {
    if (res.status === 401 && usedConsoleToken && token) {
      unauthorizedHandler?.()
    }
    throw new ApiError(res.status, (parsed && typeof parsed === 'object' ? parsed : null) as ApiErrorBody | null)
  }
  return parsed as T
}
