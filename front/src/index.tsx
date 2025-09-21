import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CustomThemeProvider } from './theme';
import { UserProvider } from './context/UserContext';
import { PostHogProvider } from 'posthog-js/react';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider } from './context/ErrorContext';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const posthogHost = process.env.REACT_APP_POSTHOG_HOST || '';
const posthogKey = process.env.REACT_APP_POSTHOG_KEY || '';


root.render(
  <React.StrictMode>

    <PostHogProvider
      apiKey={posthogKey}
      options={{
        api_host: posthogHost,
        defaults: '2025-05-24',
        capture_exceptions: true,
        capture_performance: true,
        debug: process.env.NODE_ENV === 'development',
      }}
    >
      <ErrorBoundary>
        <UserProvider>
          <CustomThemeProvider>
            <ErrorProvider>
              <App />
            </ErrorProvider>
          </CustomThemeProvider>
        </UserProvider>
      </ErrorBoundary>
    </PostHogProvider>

  </React.StrictMode>
);


// Inform TypeScript about window.posthog
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
    };
  }
}


reportWebVitals((metric: any) => {
  if (window.posthog) {
    window.posthog.capture('web_vitals', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_id: metric.id,
    });
  }
});