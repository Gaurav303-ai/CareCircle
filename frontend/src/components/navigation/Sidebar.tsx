import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { translate } from '../../i18n';

const navigation = [
  { section: 'care', links: [
    { path: '/app/dashboard', key: 'overview', icon: 'space_dashboard' },
    { path: '/app/medications', key: 'medications', icon: 'medication' },
    { path: '/app/schedule', key: 'schedule', icon: 'calendar_month' },
    { path: '/app/appointments', key: 'appointments', icon: 'event' },
    { path: '/app/members', key: 'members', icon: 'group' },
  ] },
  { section: 'stayInformed', links: [
    { path: '/app/notifications', key: 'notifications', icon: 'notifications' },
    { path: '/app/insights', key: 'insights', icon: 'monitoring' },
    { path: '/app/assistant', key: 'assistant', icon: 'auto_awesome' },
    { path: '/app/activity', key: 'activity', icon: 'history' },
  ] },
  { section: 'yourSpace', links: [
    { path: '/app/settings', key: 'settings', icon: 'settings' },
    { path: '/app/profile', key: 'profile', icon: 'account_circle' },
    { path: '/app/healthcare', key: 'healthcare', icon: 'clinical_notes' },
    { path: '/app/security', key: 'security', icon: 'shield' },
    { path: '/app/reminders', key: 'reminders', icon: 'notifications_active' },
    { path: '/app/integrations', key: 'integrations', icon: 'hub' },
    { path: '/app/accessibility', key: 'accessibility', icon: 'accessibility_new' },
    { path: '/app/help', key: 'help', icon: 'help' },
  ] },
];

export default function Sidebar() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const t = (key: string) => translate(key, state.preference.language);

  function signOut() {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  }

  return (
    <aside className="app-sidebar">
      <NavLink to="/app/dashboard" className="brand-lockup sidebar-brand">
        <span className="brand-mark material-symbols-outlined" aria-hidden="true">health_and_safety</span>
        <span><strong>CareCircle</strong><small>Connected Care</small></span>
      </NavLink>
      <div className="sidebar-profile">
        <span className="avatar avatar-green">EV</span>
        <span><strong>Eleanor Vance</strong><small>Care profile · Sample</small></span>
        <span className="material-symbols-outlined profile-chevron" aria-hidden="true">unfold_more</span>
      </div>
      <nav className="sidebar-nav" aria-label="Care workspace">
        {navigation.map((group) => <div className="nav-group" key={group.section}>
          <span className="nav-section-label">{t(group.section)}</span>
          {group.links.map((item) => <NavLink key={item.path} to={item.path} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`} end={item.path === '/app/dashboard'}>
            <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span><span>{t(item.key)}</span>
            {item.key === 'notifications' && state.notifications.some((notification) => !notification.read) && <i className="nav-unread" aria-label="Unread notifications" />}
          </NavLink>)}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-demo-note"><span className="material-symbols-outlined">science</span><span>{t('demoMode')}</span></div>
        <button className="side-link signout-button" onClick={signOut} type="button"><span className="material-symbols-outlined">logout</span><span>{t('signOut')}</span></button>
      </div>
    </aside>
  );
}
