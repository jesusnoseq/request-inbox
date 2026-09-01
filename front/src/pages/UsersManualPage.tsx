import React from 'react';
import { Box, Button, useTheme } from '@mui/material';
import ExternalLink from '../components/ExternalLink';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { codeBlockSx, bandBackground } from '../theme';

const SECTION_PADDING = { xs: 6, md: 9 };

const UsersManualPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const band = bandBackground(isDark);
    const ground = theme.palette.background.default;

    return (
        <>
            <Box component="section" sx={{ bgcolor: band, borderBottom: 1, borderColor: 'divider', py: SECTION_PADDING }}>
                <Container maxWidth="md">
                    <Typography variant="h3" component="h1" gutterBottom>
                        Request Inbox Docs
                    </Typography>
                    <Typography variant="body1" component="p" color="text.secondary" gutterBottom>
                        Here you will find instructions for using each feature of the application.
                        This documentation is a work in progress, so some sections may be incomplete.
                    </Typography>

                    <Typography variant="body1" component="p" color="text.secondary">
                        You can also read the API documentation for detailed technical information and integration guidelines.
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/api-docs')}
                        sx={{ mt: 3 }}
                    >
                        Explore API Docs
                    </Button>
                </Container>
            </Box>

            <Box component="section" sx={{ bgcolor: ground, py: SECTION_PADDING }}>
                <Container maxWidth="md">
                <Accordion elevation={0} sx={{ maxWidth: 'md', border: 1, borderColor: 'divider', borderRadius: 1.5, mb: 1.5, '&::before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="concepts-content" id="concepts-header">
                        <Typography variant="h5" component="h2" >Core Concepts</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Inbox</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Manages incoming requests. Each inbox has a unique URL that receives and captures all requests sent to it.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Request</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Represents an individual HTTP request sent to an inbox's unique URL. It records important details about the incoming request, such as its headers, body content, and timestamp.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Response</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Defines the default reply sent to the client when an inbox captures a request. The response can be customized to return specific data or status codes based on your testing needs.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Callback</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Represents an automated HTTP request triggered when an inbox receives a request. Callbacks let you forward incoming requests or notify external services about them, enabling integration workflows and webhooks. Each callback can be configured with its own URL, method, headers, and body and can optionally use dynamic templates.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>

                <Accordion elevation={0} sx={{ maxWidth: 'md', border: 1, borderColor: 'divider', borderRadius: 1.5, mb: 1.5, '&::before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="inbox-types-content" id="inbox-types-header">
                        <Typography variant="h5" component="h2" >Inbox Ownership and Visibility</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography component="p">
                            Access to an inbox depends on its ownership and visibility.
                            Anonymous inboxes have no owner and are public, while account-owned inboxes can be either public or private.
                        </Typography>
                        <List>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Anonymous Inbox</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            An anonymous inbox is a public inbox created by an unregistered user.
                                            Anyone can read, modify, or delete its contents.
                                            Anonymous inboxes do not appear in a user's inbox list and are normally accessed through a direct link to their unique URL.
                                            This makes them suitable for temporary testing when access control and visibility are not required.
                                            However, you should not use anonymous inboxes for sensitive or persistent data because they are not protected.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Public Owned Inbox</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Anyone with the direct link can read a public owned inbox and its contents.
                                            Only the owner can modify or delete them. Public visibility does not mean that the inbox appears in a public directory.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Private Owned Inbox</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            A private inbox is accessible only to its owner. Only the owner can read, modify, or delete the inbox and its contents.
                                            The inbox will still capture all incoming requests sent to its URL, but only the owner can access or manage them.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>

                <Accordion elevation={0} sx={{ maxWidth: 'md', border: 1, borderColor: 'divider', borderRadius: 1.5, mb: 1.5, '&::before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="api-keys-content" id="api-keys-header">
                        <Typography variant="h5" component="h2">API Keys</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography component="p">
                            API keys let scripts and external applications access Request Inbox as your user account.
                            Sign in, open your profile, and use API Key Management to create and delete keys.
                        </Typography>
                        <List>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Creating and Storing a Key</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Enter an optional description, choose an expiration period, and create the key.
                                            Copy the complete key immediately and store it securely. The complete value is available when the key is created; later listings show only a masked value, and the key cannot be recovered.
                                            Creating a key requires a signed-in browser session. An existing API key cannot be used to create another key.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Using a Key</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Send the key in the X-API-KEY request header. Use the key value directly without a Bearer prefix.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'curl -H "X-API-KEY: YOUR_API_KEY" \\\n  https://api.request-inbox.com/api/v1/inboxes'}
                                            </code>
                                        </Paper>
                                        <Typography variant="body2" color="text.primary">
                                            An authenticated request can list your inboxes and create, read, update, or delete inboxes as your account.
                                            It can also access your private inboxes.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Security and Errors</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Treat an API key like a password: do not include it in URLs, client-side code, logs, or public repositories.
                                            Delete keys that are no longer needed. Deletion takes effect immediately.
                                            Invalid, inactive, or expired keys return a 401 response. If no key is provided, the request continues anonymously and can access only operations available to anonymous users.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>

                <Accordion elevation={0} sx={{ maxWidth: 'md', border: 1, borderColor: 'divider', borderRadius: 1.5, mb: 1.5, '&::before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="callbacks-content" id="callbacks-header">
                        <Typography variant="h5" component="h2">Callbacks</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography component="p">
                            Callbacks send an HTTP request to another service whenever an inbox captures a request.
                            You can use them to forward requests, trigger webhooks, notify other applications, or test integrations.
                        </Typography>
                        <Typography component="p">
                            Add and manage callbacks from the inbox details page. Each callback can be enabled or disabled and configured with a destination URL, HTTP method, headers, and request body.
                            The destination must be a valid HTTP or HTTPS URL.
                        </Typography>
                        <List>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Templates</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Built-in templates are available for common use cases, including request forwarding, JSON webhooks, Slack, Discord, and Stripe.
                                            Select a template as a starting point, then review and customize its settings before saving the callback.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Forwarding Headers</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Enable header forwarding to include headers from the captured request in the callback.
                                            Headers configured directly on the callback override forwarded headers with the same name.
                                            Set a Content-Type header explicitly when the receiving service requires one.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Dynamic Callbacks</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Enable dynamic mode to use Go templates in the destination URL, HTTP method, header values, and request body.
                                            The Inbox, Request, and Index variables are available, along with the template functions described in the Dynamic Responses section.
                                            Index is the callback's zero-based position in the inbox callback list.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Callback Results</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Enabled callbacks are sent when a request is captured. The inbox waits for all callbacks to finish before returning its configured response.
                                            Open a captured request to view each callback's destination, method, status code, response headers, response body, or delivery error.
                                            Each callback is attempted once and is not retried automatically.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>

                <Accordion elevation={0} sx={{ maxWidth: 'md', border: 1, borderColor: 'divider', borderRadius: 1.5, mb: 1.5, '&::before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="dynamic-responses-content" id="dynamic-responses-header">
                        <Typography variant="h5" component="h2" >Dynamic Responses</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography component="p">
                            Dynamic responses can be enabled for each inbox individually.
                            When this feature is enabled, a response is generated for every request sent to the inbox URL by rendering templates.
                            Response header values and the response body are treated as templates.
                        </Typography>
                        <Typography component="p">
                            The status code template is an optional field available when dynamic responses are enabled.
                            It lets you define a template that generates the response status code. The template should output an integer in the application-supported range of 100 to 999.
                            If the template renders an integer in that range, that number overrides the configured status code.
                            If rendering succeeds but the result is not an accepted integer, the configured status code is used as a fallback.
                            A template syntax or execution error does not use the fallback and causes the inbox endpoint to return a 500 response.
                        </Typography>
                        <Typography component="p">
                            The response templates are rendered in the following order: status code, body, and headers.
                            As a result, the body and headers can use the rendered status code, and the headers can use the rendered response body.
                        </Typography>
                        <Typography component="p">
                            Request Inbox templates are based on <ExternalLink href="https://pkg.go.dev/text/template">Go templates</ExternalLink>.
                            The official documentation provides comprehensive guidance, while this manual includes several examples.
                        </Typography>
                        <Typography>
                            The Inbox and Request variables are available in templates. They refer to the current inbox and request and use the same structure as their REST API representations.
                        </Typography>
                        <Typography>
                            In addition to the features provided by <ExternalLink href="https://pkg.go.dev/text/template">Go templates</ExternalLink>,
                            the following functions are available:
                        </Typography>
                        <List>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">gjsonPath</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Searches for a value in a JSON document using a GJSON path.
                                            If the path is not found, the function returns <code>&lt;no value&gt;</code>.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ gjsonPath .Request.Body "path" }}'}
                                            </code>
                                        </Paper >

                                        <Typography>
                                            For more information about GJSON path expressions, see the <ExternalLink href="https://github.com/tidwall/gjson/blob/master/SYNTAX.md">GJSON Path Syntax</ExternalLink> documentation.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">gjsonPathOrDefault</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Works like gjsonPath but lets you specify a fallback value.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ gjsonPathOrDefault .Request.Body "Path" "default" }}'}
                                            </code>
                                        </Paper >
                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">toUpper</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Converts a string to uppercase.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ toUpper "this will be in uppercase"}}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>


                            <ListItem>
                                <Box>
                                    <Typography variant="body1">toLower</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Converts a string to lowercase.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ toLower "THIS WILL BE IN LOWERCASE"}}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>


                            <ListItem>
                                <Box>
                                    <Typography variant="body1">split</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Splits a string into an array of substrings using the specified separator.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ split "1,2,3" ","}}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">join</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Joins an array of strings using the specified separator.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ join (split "1,2,3" ",") " | " }}'}
                                            </code>
                                        </Paper >
                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">trimSpace</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Removes whitespace from both ends of a string.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ trimSpace " a string with spaces at the beginning and end  " }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">currentTimestampSeconds</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Returns the current timestamp in seconds.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ currentTimestampSeconds }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">now</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Returns the current date and time in the 2006-01-02 15:04:05 format.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ now }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">today</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Returns the current date in the 2006-01-02 format.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ today }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">randomString</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Generates a random string of the specified length.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ randomString 10 }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">randomInt</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Generates a random integer within the specified range.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ randomInt 0 10 }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>


                            <ListItem>
                                <Box>
                                    <Typography variant="body1">randomFloat</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Generates a random floating-point number within the specified range.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ randomFloat 0 1 }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">randomBool</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Generates a random Boolean value: either true or false.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ randomBool }}'}
                                            </code>
                                        </Paper >
                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">randomUUID</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Generates a random UUID as a string.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ randomUUID }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">intAdd</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Adds two integer values.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ intAdd 2 2 }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">intSubtract</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Subtracts one integer value from another.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ intSubtract 2 2 }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">stringToInt</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Converts a string representation of an integer to an integer value.
                                            If the conversion fails, the function returns 0.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ $n:= stringToInt .Inbox.Response.Body }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">extractURI</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Extracts the portion of the URI after /in/. This is useful for passthrough inbox scenarios.
                                            For example, if the request URI is /api/v1/inboxes/123e4567-e89b-12d3-a456-426614174000/in/extrapath?query=value,
                                            the function returns /extrapath?query=value.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ extractURI .Request.URI }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">extractPath</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Extracts only the path portion after /in/ (excluding query parameters).
                                            For example, if the request URI is /api/v1/inboxes/123e4567-e89b-12d3-a456-426614174000/in/extrapath?query=value,
                                            the function returns /extrapath.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ extractPath .Request.URI }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>

                            <ListItem>
                                <Box>
                                    <Typography variant="body1">extractQueryParams</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Extracts the query string from a URI, including the ? prefix.
                                            For example, if the request URI is /api/v1/inboxes/123e4567-e89b-12d3-a456-426614174000/in/extrapath?query=value,
                                            the function returns ?query=value.
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                            Example
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{{ extractQueryParams .Request.URI }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>


                        </List>

                        <Typography>
                            More functions may be added in the future.
                        </Typography>

                    </AccordionDetails>
                </Accordion>

                <Accordion elevation={0} sx={{ maxWidth: 'md', border: 1, borderColor: 'divider', borderRadius: 1.5, mb: 1.5, '&::before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="limits-errors-content" id="limits-errors-header">
                        <Typography variant="h5" component="h2">Limits and Errors</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography component="p">
                            Some limits are enforced by Request Inbox, while others depend on the web server, proxy, database, or cloud platform used by the deployment.
                            Infrastructure errors may not use the JSON error format described below.
                        </Typography>
                        <List>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Request Capture and Payload Size</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            The capture endpoint accepts any body format and stores the body without parsing or validating its Content-Type.
                                            Request Inbox does not impose a separate application-level limit on body size, path length, query parameters, or the number of captured headers.
                                            Effective limits still apply at the server and infrastructure layers. For example, the standalone server allows up to 1 MiB of request headers and uses 10-second read and write timeouts; proxies and hosted platforms may use different or lower limits.
                                            An oversized request may be rejected with 413, while a request that exceeds a deadline may be disconnected or return a gateway or timeout error.
                                            The instance running at request-inbox.com executes each capture as a short-lived function invocation with a total execution budget of about 15 seconds, covering parsing the incoming request, storing it, and running any enabled callbacks.
                                            A very large payload or a slow callback chain can exhaust that budget, in which case the invocation is terminated and the caller sees a gateway or timeout error even though the request itself was within the size limits described above.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Capacity, History, and Retention</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            The application does not define a fixed maximum number of inboxes, requests per inbox, or API keys per user, and list responses are not paginated.
                                            Large request histories can therefore take longer to load and produce large API responses.
                                            Available disk space, memory, database item size, service quotas, and deployment retention policies provide the practical limits.
                                            A captured request includes its body, headers, URI, and callback results, so large callback responses also consume storage and can cause the capture operation to fail.
                                            Delete inboxes, requests, and API keys that you no longer need, and do not treat an anonymous inbox as permanent storage.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Callback Limits and Errors</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            By default, an inbox can contain up to three callbacks, including disabled callbacks, and each callback has a five-second timeout. Deployments can change both values.
                                            Enabled callbacks run concurrently, but the capture request waits for all of them to finish.
                                            A callback template or delivery failure is stored with the captured request and does not change the inbox response.
                                            A callback status code of 0 indicates a template, URL, timeout, network, request-construction, or response-reading error; inspect the callback's Error field for details.
                                            HTTP 4xx and 5xx results mean the destination responded and are recorded as completed callback responses. Callbacks are attempted once and are not retried automatically.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Dynamic Template Limits and Errors</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Templates are evaluated when a request is captured, not when the inbox or callback is saved. Test them with non-sensitive sample requests before relying on them.
                                            A syntax or execution error in a response status, body, or header template returns a JSON 500 response.
                                            Callbacks have already completed and the request has already been stored when response rendering begins, so the request still appears in the inbox.
                                            Header names cannot contain templates; only header values are rendered.
                                            The application does not impose separate size or execution limits on template source or rendered output, but request deadlines, response transport, storage, and memory still apply. Keep templates and generated payloads reasonably small.
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{"code":500,"message":"body template error: ..."}'}
                                            </code>
                                        </Paper>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Response Status Codes</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            A configured or dynamically rendered response status must be an integer from 100 through 999. Dynamic values cannot contain surrounding whitespace or line breaks.
                                            If a status template renders successfully but its value is invalid, the configured static status is used; a template execution error returns 500 instead.
                                            Use conventional final HTTP status codes, normally 200 through 599, because clients and proxies may handle informational or nonstandard values unexpectedly.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Common HTTP Errors</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Application errors normally use a JSON object with code and message fields.
                                            A 400 response indicates invalid input such as malformed JSON, an invalid inbox ID, or an invalid configuration; 401 means authentication is missing or invalid; 403 means the authenticated user is not allowed to perform the operation; 404 means the resource or route was not found; and 405 means the route does not support that HTTP method.
                                            A 500 response indicates a rendering, storage, or other internal processing failure. Responses such as 413, 429, gateway errors, and timeout errors are commonly produced by deployment infrastructure and may use a different response format.
                                        </Typography>
                                        <Paper elevation={0} sx={codeBlockSx}>
                                            <code>
                                                {'{"code":400,"message":"..."}'}
                                            </code>
                                        </Paper>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Troubleshooting</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.primary">
                                            Confirm the inbox ID and route first, then inspect the stored request and callback results.
                                            A missing template variable or map key may render as &lt;no value&gt; instead of returning an error; check field names and use Go template actions such as with and index for optional or multi-value data.
                                            Set Content-Type explicitly when generating JSON or another structured format, and make sure inserted values do not make the rendered body invalid.
                                            If the application does not return its usual JSON error object, check the deployment's proxy, server, and platform logs for payload, quota, or timeout failures.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>
                </Container>
            </Box>
        </>
    );
};


export default UsersManualPage;
