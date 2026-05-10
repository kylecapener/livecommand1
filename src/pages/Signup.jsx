import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp, TIMEZONES } from '../context/AppContext'
import styles from './Signup.module.css'

export default function Signup() {
  const { signup } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    smsOptIn: true,
  })

  function set(field) {
    return e => { setForm(f => ({ ...f, [field]: e.target.value })); setError('') }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Enter your name'); return }
    if (!form.email.includes('@')) { setError('Enter a valid email'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    signup({ name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim(), timezone: form.timezone, smsOptIn: form.smsOptIn })
    navigate('/dashboard')
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.card}>
        <div className={styles.logoMark}>⚡</div>
        <h1 className={styles.title}>Join LiveCommand</h1>
        <p className={styles.subtitle}>Set up your creator account</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Your name</label>
            <input
              className={`${styles.input} ${styles.inputFull}`}
              type="text"
              placeholder="How you appear to other creators"
              value={form.name}
              onChange={set('name')}
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            <input
              className={`${styles.input} ${styles.inputFull}`}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Phone number</label>
            <input
              className={`${styles.input} ${styles.inputFull}`}
              type="tel"
              placeholder="(555) 000-0000"
              value={form.phone}
              onChange={set('phone')}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <input
              className={`${styles.input} ${styles.inputFull}`}
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set('password')}
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Your timezone</label>
            <select
              className={`${styles.input} ${styles.inputFull} ${styles.select}`}
              value={form.timezone}
              onChange={set('timezone')}
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            <p className={styles.hint}>Battle times will be shown in your local time.</p>
          </div>

          <div className={styles.smsToggle}>
            <div className={styles.smsToggleText}>
              <span className={styles.smsToggleLabel}>SMS battle alerts</span>
              <span className={styles.smsToggleHint}>Get texts when invited to battles (coming soon).</span>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${form.smsOptIn ? styles.toggleOn : ''}`}
              onClick={() => setForm(f => ({ ...f, smsOptIn: !f.smsOptIn }))}
              aria-pressed={form.smsOptIn}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create account →'}
          </button>
        </form>

        <p className={styles.switchPrompt}>
          Already have an account? <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
