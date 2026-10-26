import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/request.ts'

/** Mantém o carrinho até a API confirmar e ignora respostas de uma sessão encerrada. */
export function useOrderSubmission() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [canReload, setCanReload] = useState(false)
  const busy = useRef(false)
  const version = useRef(0)

  const reset = useCallback(() => {
    version.current += 1
    busy.current = false
    setPending(false)
    setError('')
    setCanReload(false)
  }, [])

  useEffect(() => () => { version.current += 1 }, [])

  async function run(submit: () => Promise<void>): Promise<boolean> {
    if (busy.current) return false
    busy.current = true
    const current = version.current
    setPending(true)
    setError('')
    setCanReload(false)
    try {
      await submit()
      return current === version.current
    } catch (err) {
      if (current === version.current) {
        setCanReload(err instanceof ApiError && err.status === 409)
        setError(err instanceof TypeError
          ? 'Não foi possível confirmar o envio. Confira seus pedidos ou fale com a equipe antes de tentar novamente.'
          : err instanceof Error ? err.message : 'Não foi possível enviar o pedido. Fale com a equipe.')
      }
      return false
    } finally {
      if (current === version.current) {
        busy.current = false
        setPending(false)
      }
    }
  }

  return { pending, error, canReload, run, reset }
}
