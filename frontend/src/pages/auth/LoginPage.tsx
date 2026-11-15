import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext, type UserRole } from '../../context/AppContext';

export default function LoginPage() {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    if (!email || !String(formData.get('password') ?? '')) {
      setError('Enter your email and password to continue.');
      return;
    }
    const name = email.split('@')[0].split(/[._-]/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(' ') || 'CareCircle member';
    dispatch({ type: 'LOGIN', payload: { id: 'prototype-user', name, email, role: 'family' as UserRole } });
    navigate('/app/dashboard');
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-intro">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Care feels better when you’re connected.</h1>
          <p>Sign in to see the routines and updates your care circle has chosen to share.</p>
          <div className="auth-quote"><span className="material-symbols-outlined">favorite</span><p>“A little more clarity for everyone involved in care.”</p><small>CareCircle · Connected Care. Peace of Mind.</small></div>
        </div>
        <form className="auth-form" onSubmit={signIn}>
          <div className="auth-form-heading"><h2>Sign in</h2><p>Continue to your CareCircle workspace.</p></div>
          <div className="prototype-notice"><span className="material-symbols-outlined">science</span><span><strong>Prototype sign-in</strong><br />No password is verified or sent to a server. Use any valid email and a password to preview the demo.</span></div>
          <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required /></label>
          <div className="auth-options"><label className="check-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me on this device</label><a href="#forgot-password" onClick={(event) => { event.preventDefault(); setError('Password reset is not connected in this prototype.'); }}>Forgot password?</a></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit">Sign in <span aria-hidden="true">→</span></button>
          <div className="auth-divider"><span>or explore the prototype</span></div>
          <Link className="button button-secondary auth-submit" to="/demo">Continue with sample care circle</Link>
          <p className="auth-switch">New to CareCircle? <Link to="/register">Create an account</Link></p>
          <p className="auth-switch">Have an invitation code? <Link to="/onboarding/join">Join a CareCircle</Link></p>
          <small className="auth-legal">By continuing, you agree to our <a href="/#privacy">privacy approach</a>. This demo is not a secure clinical service.</small>
        </form>
      </section>
    </div>
  );
}
