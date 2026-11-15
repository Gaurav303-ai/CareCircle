import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export default function RegisterPage() {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') ?? '');
    if (password !== String(formData.get('confirmPassword') ?? '')) {
      setError('The passwords do not match.');
      return;
    }
    dispatch({
      type: 'LOGIN',
      payload: {
        id: 'prototype-user',
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        role: 'family',
      },
    });
    navigate('/onboarding/role');
  }

  return (
    <div className="auth-page">
      <section className="auth-panel auth-panel-register">
        <div className="auth-intro">
          <span className="eyebrow">A CIRCLE THAT CARES</span>
          <h1>Start with your people.</h1>
          <p>Set up a shared space for medication routines, appointments, and the people you trust.</p>
          <ul className="auth-benefits"><li><span className="material-symbols-outlined">verified_user</span> You choose who joins</li><li><span className="material-symbols-outlined">accessibility_new</span> A calmer, accessible experience</li><li><span className="material-symbols-outlined">notifications_active</span> Clear updates for your circle</li></ul>
        </div>
        <form className="auth-form" onSubmit={register}>
          <div className="auth-form-heading"><h2>Create your account</h2><p>Start your CareCircle prototype.</p></div>
          <div className="prototype-notice"><span className="material-symbols-outlined">science</span><span>This is a local prototype. Account details are only held in memory and are not sent to a service.</span></div>
          <label>Full name<input name="name" autoComplete="name" placeholder="Your name" required maxLength={100} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" minLength={12} placeholder="At least 12 characters" required /></label>
          <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} placeholder="Enter your password again" required /></label>
          <label className="check-label terms-check"><input name="terms" type="checkbox" required /> I agree to the <a href="/#privacy">privacy approach</a> and understand this is a demonstration.</label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit">Continue to choose a role <span aria-hidden="true">→</span></button>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="auth-switch">Joining an existing circle? <Link to="/onboarding/join">Use an invitation code</Link></p>
        </form>
      </section>
    </div>
  );
}
