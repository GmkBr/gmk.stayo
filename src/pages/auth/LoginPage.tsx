import { type FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.tsx'
import { useApp } from '../../context/AppContext.tsx'
import { postLoginPath } from '../../auth/account.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { StayoLogo } from '../../components/brand/StayoLogo.tsx'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const { signIn, signUp, accessToken, ready, user } = useAuth()
  const { profile, bootstrapping } = useApp()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (ready && accessToken && user) {
    if (user.accountType === 'totem') {
      return <Navigate to="/totem" replace />
    }
    if (profile && !bootstrapping) {
      return <Navigate to={postLoginPath(profile)} replace />
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
      } else {
        if (!fullName.trim()) {
          setError('Informe o nome completo.')
          return
        }
        await signUp({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-soft">
        <StayoLogo className="mb-6" />
        <h1 className="text-xl font-semibold text-ink">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          {mode === 'login'
            ? 'Console da equipe ou totem do hotel — o sistema detecta o tipo de conta automaticamente.'
            : 'Cadastro de operador — totens são criados no console, em Totens.'}
        </p>

        <form className="mt-6 flex flex-col gap-3" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <Input
              label="Nome completo"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          )}
          <Input
            label="E-mail ou login do totem"
            type="text"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-4 text-center text-[13px] text-muted">
          {mode === 'login' ? (
            <>
              Não tem conta de operador?{' '}
              <button
                type="button"
                className="font-medium text-ink underline"
                onClick={() => {
                  setMode('signup')
                  setError('')
                }}
              >
                Criar agora
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button
                type="button"
                className="font-medium text-ink underline"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
