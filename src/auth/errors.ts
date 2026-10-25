import { ApiError } from '../api/client.ts'

const LOGIN_INVALID_CREDENTIALS = 'Usuário ou senha incorretos.'

export function authFormErrorMessage(err: unknown, mode: 'login' | 'signup'): string {
  if (err instanceof ApiError) {
    if (mode === 'login' && (err.status === 400 || err.status === 401)) {
      return LOGIN_INVALID_CREDENTIALS
    }
    if (err.message && err.message !== `Erro HTTP ${err.status}`) {
      return err.message
    }
  }
  if (err instanceof Error && err.message) return err.message
  return mode === 'login' ? 'Não foi possível entrar. Tente novamente.' : 'Não foi possível criar a conta. Tente novamente.'
}
