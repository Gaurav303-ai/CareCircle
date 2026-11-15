import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext, type Language } from '../../context/AppContext';
import { languageNames, translate } from '../../i18n';

const languages: Language[] = ['en', 'hi', 'bn', 'ta', 'te'];

export default function TopBar() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const unreadCount = state.notifications.filter((item) => !item.read).length;
  const t = (key: string) => translate(key, state.preference.language);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    if (!value) return;
    if (value.includes('appoint') || value.includes('doctor')) navigate('/app/appointments');
    else if (value.includes('member') || value.includes('family')) navigate('/app/members');
    else if (value.includes('insight') || value.includes('report')) navigate('/app/insights');
    else if (value.includes('notification') || value.includes('alert')) navigate('/app/notifications');
    else if (value.includes('schedule') || value.includes('today')) navigate('/app/schedule');
    else navigate('/app/medications');
  }

  function signOut() {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  }

  return (
    <header className="app-topbar">
      <div className="mobile-brand">
        <Link className="brand-lockup" to="/app/dashboard"><span className="brand-mark material-symbols-outlined">health_and_safety</span><strong>CareCircle</strong></Link>
        <details className="mobile-menu"><summary aria-label="Open workspace navigation"><span className="material-symbols-outlined">menu</span></summary><nav aria-label="Mobile workspace navigation">{[
          ['overview', '/app/dashboard'], ['medications', '/app/medications'], ['schedule', '/app/schedule'], ['appointments', '/app/appointments'], ['members', '/app/members'], ['notifications', '/app/notifications'], ['insights', '/app/insights'], ['assistant', '/app/assistant'], ['settings', '/app/settings'], ['accessibility', '/app/accessibility'],
        ].map(([key, path]) => <Link key={path} to={path} onClick={(event) => {
          const menu = event.currentTarget.closest('details');
          if (menu) menu.open = false;
        }}>{t(key)}</Link>)}</nav></details>
      </div>
      <div className="topbar-crumb"><span className="material-symbols-outlined" aria-hidden="true">home</span><span>Care workspace</span><span className="crumb-divider">/</span><strong>{window.location.pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') ?? 'Overview'}</strong></div>
      <form className="global-search" role="search" onSubmit={search}>
        <label htmlFor="care-search" className="sr-only">{t('search')}</label><span className="material-symbols-outlined" aria-hidden="true">search</span>
        <input id="care-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('search')} aria-label={t('search')} />
        <button type="submit" className="sr-only">Search</button>
      </form>
      <div className="topbar-actions">
        <label className="language-control app-language">
          <span className="material-symbols-outlined" aria-hidden="true">language</span><span className="sr-only">{t('language')}</span>
          <select aria-label={t('language')} value={state.preference.language} onChange={(event) => dispatch({ type: 'SET_PREFERENCE', payload: { language: event.target.value as Language } })}>
            {languages.map((language) => <option key={language} value={language}>{languageNames[language]}</option>)}
          </select>
        </label>
        <Link className="icon-button notification-button" to="/app/notifications" aria-label={`${t('notifications')}${unreadCount ? `, ${unreadCount} unread` : ''}`}>
          <span className="material-symbols-outlined" aria-hidden="true">notifications</span>{unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
        </Link>
        <details className="profile-menu">
          <summary><span className="avatar avatar-lavender">{state.user?.name.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'PS'}</span><span className="profile-menu-label"><strong>{state.user?.name ?? 'CareCircle member'}</strong><small>{state.user?.role ?? 'family'} · Demo</small></span><span className="material-symbols-outlined">expand_more</span></summary>
          <div className="profile-dropdown"><Link to="/app/profile">My profile</Link><Link to="/app/security">Account &amp; security</Link><button type="button" onClick={signOut}>{t('signOut')}</button></div>
        </details>
      </div>
    </header>
  );
}
