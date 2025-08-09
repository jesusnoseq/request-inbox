import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';

const PageTracker = () => {
  const location = useLocation();
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        path: location.pathname,
        search: location.search,
        hash: location.hash,
      });
    }
  }, [location, posthog]);

  return null;
};

export default PageTracker;
