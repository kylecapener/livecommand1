import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CreateSeriesModal from './CreateSeriesModal'
import styles from './NavBar.module.css'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

export default function NavBar() {
  const { user, logout, myInvitations } = useApp()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  function handleLogout() { logout(); navigate('/schedule') }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to={user ? '/dashboard' : '/battles'} className={styles.logo}>
            <span className={styles.logoMark}>⚡</span>
            <span className={styles.logoText}>LiveCommand</span>
          </Link>

          <nav className={styles.nav}>
            {user && (
              <NavLink to="/dashboard" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                My Battles
                {myInvitations.length > 0 && <span className={styles.dot} />}
              </NavLink>
            )}
            <NavLink to="/battles" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              All Battles
            </NavLink>
            <NavLink to="/creators" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              Creators
            </NavLink>
          </nav>

          <div className={styles.right}>
            {user ? (
              <>
                <button className={styles.createBtn} onClick={() => setCreating(true)}>
                  + New Battle
                </button>
                <div className={styles.userBtn} onClick={handleLogout} title={`Sign out (${user.name})`}>
                  <div className={styles.userAvatar}>{initials(user.name)}</div>
                </div>
              </>
            ) : (
              <div className={styles.authRow}>
                <Link to="/login" className={styles.signInBtn}>Sign in</Link>
                <Link to="/signup" className={styles.joinBtn}>Join</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {creating && (
        <CreateSeriesModal
          prefill={null}
          onClose={() => setCreating(false)}
          onCreated={() => setCreating(false)}
        />
      )}
    </>
  )
}
