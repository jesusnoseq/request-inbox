import { useMatch } from 'react-router-dom';

/** Route-specific tool registration point for the inbox detail page. */
const InboxDetailWebMCPTools = () => null;

/** Keeps future page-specific tools mounted only while their page is active. */
const PageWebMCPTools = () => {
  const inboxDetailMatch = useMatch('/inbox/:inboxId');

  return inboxDetailMatch ? <InboxDetailWebMCPTools /> : null;
};

export default PageWebMCPTools;
