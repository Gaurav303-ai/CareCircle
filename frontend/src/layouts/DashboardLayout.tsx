import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import TopBar from '../components/navigation/TopBar';
import { useAppContext } from '../context/AppContext';

export default function DashboardLayout() {
  const { state } = useAppContext();
  const preferenceClass = [
    `text-size-${state.preference.textSize}`,
    state.preference.highContrast ? 'high-contrast' : '',
    state.preference.reducedMotion ? 'reduced-motion' : '',
    state.preference.simplified ? 'simplified-interface' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`app-shell ${preferenceClass}`}>
      <Sidebar />
      <div className="app-content">
        <TopBar />
        <main className="workspace-main" id="main-content"><Outlet /></main>
      </div>
    </div>
  );
}
