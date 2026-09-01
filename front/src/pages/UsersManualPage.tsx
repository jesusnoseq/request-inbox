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
                        <Typography variant="h5" component="h2" >Anonymous, Public, and Private Inboxes</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography component="p">
                            The application provides three types of inboxes: anonymous, public, and private. Each type has distinct permissions for accessing and managing captured requests.
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
                                            An anonymous inbox is a type of public inbox with open access that is created by an unregistered user.
                                            Anyone can read, modify, or delete its contents.
                                            Anonymous inboxes are not listed in the web interface or API and are accessible only through a direct link to their unique URL.
                                            This makes them suitable for temporary testing when access control and visibility are not required.
                                            However, you should not use anonymous inboxes for sensitive or persistent data because they are not protected.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Public Inbox</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            A public inbox is visible to everyone, so any user can read its contents. However, only the owner can modify or delete the inbox and its contents.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body1">Private Inbox</Typography>
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
                            It lets you define a template that generates the response status code. The template should output an integer between 100 and 999.
                            If the template renders a valid number, that number overrides the configured status code.
                            The configured status code is used as a fallback if the template does not render a valid HTTP status code.
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
                                            For example, if the request URI is /api/v1/inboxes/123/in/extrapath?query=value,
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
                                            For example, if the request URI is /api/v1/inboxes/123/in/extrapath?query=value,
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
                                            For example, if the request URI is /api/v1/inboxes/123/in/extrapath?query=value,
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
                </Container>
            </Box>
        </>
    );
};


export default UsersManualPage;
