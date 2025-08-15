import React from 'react';
import { Box, Button } from '@mui/material';
import ExternalLink from '../components/ExternalLink';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const UsersManualPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Request Inbox Docs
                </Typography>
                <Typography variant="body1" component="p">
                    Here you will find instructions on how to use each feature of our application.
                    This is a work in progress, so please forgive the lack of completeness.
                </Typography>

                <Typography variant="body1" component="p">
                    You can also check our API docs for more detailed technical information and integration guidelines.
                </Typography>


                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/api-docs')}
                    sx={{ m: 2 }}
                >
                    Explore API Docs
                </Button>

                <Accordion sx={{ maxWidth: 'md' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                        <Typography variant="h5" component="h3" >Core Concepts</Typography>
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
                                            Manages incoming requests. Each Inbox has a unique URL that receives and captures all requests sent to it.
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
                                            Represents each individual HTTP request sent to the Inbox's unique URL. This entity logs important details of the incoming request, such as headers, body content, and timestamp.
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
                                            Defines the default reply sent back to the client when a request is captured by an Inbox. The Response entity can be customized to return specific data or statuses based on testing needs.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>

                <Accordion sx={{ maxWidth: 'md' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                        <Typography variant="h5" component="h3" >Anonymous, Public and Private Inboxes</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography component="p">
                            The application provides three types of inboxes: Anonymous, Public and Private. Each has distinct permissions for managing access to captured requests.
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
                                            An Anonymous Inbox is a type of Public Inbox with open access, created by unregistered users.
                                            Anyone can read, modify, or delete the contents of an Anonymous Inbox, making it completely open.
                                            Anonymous Inboxes are not listed within the web interface or API, making them accessible only via a direct link to their unique URL.
                                            This makes them suitable for temporary testing needs where access control and visibility are not required.
                                            However, it's important to avoid using Anonymous Inboxes for sensitive or persistent data due to their lack of protection.
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
                                            A Public Inbox is visible to everyone, allowing any user to read its contents. However, only the owner has permission to modify or delete the inbox and its contents.
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
                                            A Private Inbox is fully restricted to the owner. Only the owner can read, modify, or delete the inbox and its contents.
                                            The inbox will still capture all incoming requests sent to its URL, but only the owner can access or manage them.
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>

                <Accordion sx={{ maxWidth: 'md' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                        <Typography variant="h5" component="h3" >Dynamic Responses</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography component="p">
                            Dynamic responses can be activated for each inbox individually.
                            This feature ensures that for each request sent to the inbox URL, a specific response will be calculated by rendering templates.
                            Once enabled, header values and response body are treated as templates.
                        </Typography>
                        <Typography component="p">
                            The status code template is an optional special field that can be filled once dynamic response is activated.
                            It allows you to set up a template to calculate the status code of a response. The template should output an integer between 100 and 999.
                            If the template renders a number successfully, it will override the status code.
                            The status code value will be used as a fallback when rendering the status code template does not result in a valid HTTP status code number.
                        </Typography>
                        <Typography component="p">
                            The rendering order of the response templates is: status code template, body, and headers.
                            In this way, for example, headers and body can use the result of rendering the status code template in the status code field, and headers can use a rendered response body.
                        </Typography>
                        <Typography component="p">
                            Request Inbox templates are based on <ExternalLink href="https://pkg.go.dev/text/template">Golang templates</ExternalLink>.
                            The documentation is comprehensive, and this manual will provide some examples.
                        </Typography>
                        <Typography>
                            Inbox and Request are variables available for use. Both refer to the current inbox and request and have the same structure as they have in the REST API.
                        </Typography>
                        <Typography>
                            In addition to <ExternalLink href="https://pkg.go.dev/text/template">Golang templates</ExternalLink> features,
                            the following functions have been implemented:
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
                                            Searches for values in a JSON document with a GJSON Path.
                                            If the path is not found, then the value is <code>&lt;no value&gt;</code>
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
                                            <code>
                                                {'{{ gjsonPath .Request.Body "path" }}'}
                                            </code>
                                        </Paper >

                                        <Typography>
                                            For more information about GJSON Path syntax expressions, check <ExternalLink href="https://github.com/tidwall/gjson/blob/master/SYNTAX.md">GJSON Path syntax</ExternalLink>
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
                                            Same as GJSON Path, but it provides a way to set a fallback value
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Converts a string to uppercase
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Converts a string to lowercase
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Splits a string into an array of substrings based on a specified separator
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Removes whitespace from both ends of a string
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Gets the current timestamp in seconds
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Gets the current date and time in 2006-01-02 15:04:05 format
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Gets the current date in 2006-01-02 format
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Generates a random string of the specified length
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Generates a random integer within the specified range
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Generates a random float within the specified range
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Generates a random boolean value, either true or false
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Generates a random UUID as a string
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Sums two integer values
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Performs subtraction on two integer values
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
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
                                            Converts a string representing an integer into an actual integer value.
                                            If it fails, returns 0 as an integer
                                        </Typography>
                                        <Typography sx={{ mt: 0.1 }}>
                                            Example
                                        </Typography>
                                        <Paper >
                                            <code>
                                                {'{{ $n:= stringToInt .Inbox.Response.Body }}'}
                                            </code>
                                        </Paper >

                                    </Box>
                                </Box>
                            </ListItem>


                        </List>

                        <Typography>
                            More functions can be added in the future.
                        </Typography>

                    </AccordionDetails>
                </Accordion>
            </Box >
        </Container >
    );
};


export default UsersManualPage;