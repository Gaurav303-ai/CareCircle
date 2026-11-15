import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProvider } from './context/AppContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('CareCircle could not find the application root element.');
}

ReactDOM.createRoot(rootElement).render(
    <AppProvider>
      <App />
    </AppProvider>
);
