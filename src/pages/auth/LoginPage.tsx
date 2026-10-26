import { type FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.tsx'
import { useApp } from '../../app/useApp.ts'
import { isTotemAccount, postLoginPath } from '../../auth/account.ts'
import { authFormErrorMessage } from '../../auth/errors.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { StayoLogo } from '../../components/brand/StayoLogo.tsx'
import { DEMO_CHEAT, DEMO_LOGINS, DEMO_PASSWORD, isDemoMode } from '../../demo/mode.ts'

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
  const [resetNote, setResetNote] = useState('')
  const demo = isDemoMode()

  if (ready && accessToken) {
    if (isTotemAccount(user) || isTotemAccount(profile)) {
      return <Navigate to="/totem" replace />
    }
    if (user && profile && !bootstrapping) {
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
      setError(authFormErrorMessage(err, mode))
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
            passwordToggle
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
          {error && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        {demo && mode === 'login' && (
          <div className="mt-5 rounded-xl border border-line bg-canvas p-3">
            <p className="text-[12px] font-medium text-ink">Modo demonstração</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Sem backend. Senha de todas as contas: {DEMO_PASSWORD}. Escolha Hotel Aurora depois do login.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEMO_LOGINS.map((item) => (
                <button
                  key={item.login}
                  type="button"
                  disabled={loading}
                  title={item.hint}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-left text-[12px] text-ink hover:border-ink/20 disabled:opacity-40"
                  onClick={() => {
                    setEmail(item.login)
                    setPassword(DEMO_PASSWORD)
                    setError('')
                    setResetNote('')
                  }}
                >
                  <span className="block font-medium">{item.label}</span>
                  <span className="block text-muted">{item.hint}</span>
                </button>
              ))}
            </div>
            <ul className="mt-3 space-y-1 text-[12px] text-muted">
              {DEMO_CHEAT.map((item) => (
                <li key={item.label}>
                  <span className="font-medium text-ink">{item.label}:</span> {item.value}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 text-[12px] font-medium text-ink underline"
              onClick={() => {
                void import('../../demo/store.ts').then(({ resetDemoState }) => {
                  resetDemoState()
                  setResetNote('Cenário restaurado. Pode entrar de novo.')
                  setError('')
                }).catch(() => setError('Não foi possível restaurar a demonstração. Recarregue a página.'))
              }}
            >
              Restaurar cenário
            </button>
            {resetNote && <p className="mt-2 text-[12px] text-muted">{resetNote}</p>}
          </div>
        )}

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
