import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

function Login() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async ({ email, password }) => {
    setServerError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const user = cred.user
      // Get and store ID token
      const token = await user.getIdToken()
      localStorage.setItem('authToken', token)
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      const code = err?.code || 'auth/unknown'
      let message = 'Invalid credentials. Please try again.'
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          message = 'Incorrect email or password.'
          break
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.'
          break
        default:
          message = err?.message || message
      }
      setServerError(message)
      // Explicit alert for wrong credentials per requirement
      window.alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xxl-6">
            <div className="auth-card card border-0 shadow-lg overflow-hidden">
              <div className="row g-0">
                <div className="col-lg-5 d-none d-lg-block gradient-side position-relative">
                  <div className="p-4 text-white position-relative" style={{ zIndex: 1 }}>
                    <h3 className="fw-semibold mb-2">Welcome back</h3>
                    <p className="mb-0 opacity-75">Log in to your mailbox.</p>
                  </div>
                </div>

                <div className="col-12 col-lg-7 bg-white">
                  <div className="p-4 p-md-5">
                    <h4 className="mb-3 text-center">Login</h4>

                    {serverError && (
                      <div className="alert alert-danger" role="alert">{serverError}</div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          id="email"
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="you@example.com"
                          {...register('email')}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email.message}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                          id="password"
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          placeholder="••••••••"
                          {...register('password')}
                        />
                        {errors.password && (
                          <div className="invalid-feedback d-block">{errors.password.message}</div>
                        )}
                      </div>

                      <button type="submit" className="btn btn-primary w-100 py-2" disabled={!isValid || loading}>
                        {loading ? 'Logging in…' : 'Login'}
                      </button>

                      <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={() => navigate('/signup')}>
                        Create an account
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
