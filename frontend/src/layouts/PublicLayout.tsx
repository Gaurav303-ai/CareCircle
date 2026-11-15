import { Link, Outlet } from 'react-router-dom';
import { useAppContext, type Language } from '../context/AppContext';
import { languageNames, translate } from '../i18n';

const languages: Language[] = ['en', 'hi', 'bn', 'ta', 'te'];

export default function PublicLayout() {
  const { state, dispatch } = useAppContext();
  const t = (key: string) => translate(key, state.preference.language);

  return (
    <div className="public-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="public-header">
        <Link className="brand-lockup" to="/" aria-label="CareCircle home">
          <span className="brand-mark material-symbols-outlined" aria-hidden="true">health_and_safety</span>
          <span><strong>CareCircle</strong><small>Connected Care. Peace of Mind.</small></span>
        </Link>
        <nav className="public-nav" aria-label="Main navigation">
          <a href="/#features">Features</a>
          <a href="/#how-it-works">How it works</a>
          <a href="/#why-carecircle">Why CareCircle</a>
          <a href="/#privacy">Privacy</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          <label className="language-control">
            <span className="material-symbols-outlined" aria-hidden="true">language</span>
            <span className="sr-only">{t('language')}</span>
            <select
              aria-label={t('language')}
              value={state.preference.language}
              onChange={(event) => dispatch({ type: 'SET_PREFERENCE', payload: { language: event.target.value as Language } })}
            >
              {languages.map((language) => <option key={language} value={language}>{languageNames[language]}</option>)}
            </select>
          </label>
          <Link className="button button-quiet header-signin" to="/login">Sign in</Link>
          <Link className="button button-primary header-demo" to="/demo">{t('liveDemo')} <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
      <main id="main-content"><Outlet /></main>
      <footer className="public-footer">
        <div className="footer-brand">
          <Link className="brand-lockup" to="/">
            <span className="brand-mark material-symbols-outlined" aria-hidden="true">health_and_safety</span>
            <span><strong>CareCircle</strong><small>Connected Care. Peace of Mind.</small></span>
          </Link>
          <p>Everyday care, made easier to share.</p>
        </div>
        <div className="footer-links">
          <a href="/#features">Features</a><a href="/#about">About</a><a href="/#privacy">Privacy</a>
          <a href="/#faq">Help center</a><a href="/#contact">Contact</a>
        </div>
        <p className="footer-note">Prototype for demonstration. Not for medical decisions or emergency use.</p>
      </footer>
    </div>
  );
}
