"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push(callbackUrl)
      router.refresh()
    } else {
      setError("Invalid email or password")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-green-700">FieldBook</div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">by UzimzAmka</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white rounded-xl py-3 font-medium hover:bg-green-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.532 24.552c0-1.636-.147-3.2-.42-4.704H24.48v8.896h12.984c-.56 3.02-2.26 5.58-4.816 7.296v6.064h7.796c4.56-4.2 7.088-10.392 7.088-17.552z" fill="#4285F4"/>
              <path d="M24.48 48c6.48 0 11.916-2.148 15.888-5.836l-7.796-6.064c-2.148 1.44-4.896 2.292-8.092 2.292-6.228 0-11.508-4.208-13.396-9.868H2.964v6.252C6.916 42.628 15.096 48 24.48 48z" fill="#34A853"/>
              <path d="M11.084 28.524A14.383 14.383 0 0 1 10.32 24c0-1.568.268-3.092.764-4.524v-6.252H2.964A23.992 23.992 0 0 0 .48 24c0 3.876.928 7.548 2.484 10.776l8.12-6.252z" fill="#FBBC05"/>
              <path d="M24.48 9.608c3.508 0 6.656 1.208 9.132 3.572l6.848-6.848C36.392 2.392 30.956 0 24.48 0 15.096 0 6.916 5.372 2.964 13.224l8.12 6.252c1.888-5.66 7.168-9.868 13.396-9.868z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{" "}
          <a href="/register" className="text-green-700 font-medium hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
