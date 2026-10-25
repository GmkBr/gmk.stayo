import { isDemoMode } from '../demo/mode.ts'
import { DemoHttpError } from '../demo/http.ts'
import { ApiError, createApiClient, createHttpTransport } from './request.ts'

export { ApiError } from './request.ts'
export type { ApiErrorBody, RequestOptions, TokenProvider, UnauthorizedHandler } from './request.ts'

const httpTransport = createHttpTransport(() => {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!base?.trim()) throw new Error('VITE_API_BASE_URL não configurada')
  return base
})

const client = createApiClient(async (path, options) => {
  if (!isDemoMode()) return httpTransport(path, options)
  const { handleDemoRequest } = await import('../demo/handleRequest.ts')
  try {
    return await handleDemoRequest(path, options)
  } catch (err) {
    if (err instanceof DemoHttpError) throw new ApiError(err.status, { message: err.message })
    throw err
  }
})

export const { apiRequest, setAccessTokenProvider, setUnauthorizedHandler, invalidateSession } = client
