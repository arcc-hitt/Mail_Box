import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { ref, set } from 'firebase/database'
import { auth, db } from '../firebase'
import { signupSchema, passwordChecks } from '../features/auth/validation'
import { useNavigate } from 'react-router-dom'

function Signup() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const passwordValue = watch('password') || ''
  const emailValue = watch('email') || ''

  const onSubmit = async (values) => {
    setServerError('')
    setSuccess('')
    setLoading(true)

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      )
      const user = cred.user

      try {
        const displayName = values.email.split('@')[0]
        await updateProfile(user, { displayName })
      } catch (_) {}

      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
      })

  console.log('User has successfully signed up')
  setSuccess('Account created successfully. Redirecting to login…')
  reset()
  navigate('/login', { replace: true })
    } catch (err) {
      const code = err?.code || 'auth/unknown'
      let message = 'Something went wrong. Please try again.'
      switch (code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered.'
          break
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.'
          break
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters.'
          break
        default:
          message = err?.message || message
      }
      setServerError(message)
    } finally {
      setLoading(false)
    }
  }

  const checklist = useMemo(() => {
    const local = emailValue.split('@')[0]?.toLowerCase() || ''
    const withNoEmailName = local ? !passwordValue.toLowerCase().includes(local) : true
    return [
      ...passwordChecks.map((pc) => ({ label: pc.label, ok: pc.test(passwordValue) })),
      { label: 'Does not contain your email name', ok: withNoEmailName },
    ]
  }, [passwordValue, emailValue])

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xxl-6">
            <div className="auth-card card border-0 shadow-lg overflow-hidden">
              <div className="row g-0">
                {/* Left side - decorative gradient */}
                <div className="col-lg-5 d-none d-lg-block gradient-side position-relative">
                  <div className="p-4 text-white position-relative" style={{ zIndex: 1 }}>
                    <h3 className="fw-semibold mb-2">Welcome!</h3>
                    <p className="mb-0 opacity-75">Create your account to get started.</p>
                  </div>
                </div>

                {/* Right side - form */}
                <div className="col-12 col-lg-7 bg-white">
                  <div className="p-4 p-md-5">
                    <h4 className="mb-3 text-center">Create your account</h4>

                    {serverError && (
                      <div className="alert alert-danger" role="alert">{serverError}</div>
                    )}
                    {success && (
                      <div className="alert alert-success" role="alert">{success}</div>
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
                        <div className="input-group">
                          <input
                            id="password"
                            type="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="••••••••"
                            {...register('password')}
                          />
                        </div>
                        {errors.password && (
                          <div className="invalid-feedback d-block">{errors.password.message}</div>
                        )}

                        {/* Password checklist */}
                        <ul className="password-checklist small mt-2">
                          {checklist.map((item) => (
                            <li key={item.label} className={item.ok ? 'ok' : ''}>
                              <span className="indicator me-2" aria-hidden>
                                {item.ok ? '✓' : '•'}
                              </span>
                              {item.label}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          placeholder="Repeat password"
                          {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                          <div className="invalid-feedback d-block">{errors.confirmPassword.message}</div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-2"
                        disabled={!isValid || loading}
                      >
                        {loading ? 'Creating account…' : 'Sign up'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100 mt-2"
                        onClick={() => navigate('/login')}
                      >
                        Already have an account? Login
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

export default Signup
