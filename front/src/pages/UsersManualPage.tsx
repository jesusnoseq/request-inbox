import React from 'react';
import Box from '@mui/material/Box';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ExternalLink from '../components/ExternalLink';

import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const UsersManualPage: React.FC = () => {
    return (
        <Container>
            <Header />
            <Box my={4}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Request Inbox user's manual
                </Typography>
                <Typography variant="body1" paragraph>
                    Welcome to the user manual. Here you will find detailed instructions on how to use each feature of our application.<br />
                    This is a work in progress so forgive me for the lack of completeness.
                </Typography>


                <Accordion sx={{ maxWidth: 'md' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                        <Typography variant="h5" component="h3" >Dynamic responses</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography paragraph>
                            Dynamic responses can be activated for each inbox individually.
                            This feature make that for each request sent to the inbox URL a specific response will be calculated by rendering templates.
                            Once enabled, headers values and response body are threated as templates.
                        </Typography>
                        <Typography paragraph>
                            Status code template is a optional special field that can be filled once dynamic response is activated.
                            It allows setup a template to calculate the status code of a response. The template should output an integer between 100 and 999.
                            If the template renders a number successfully, it will rewrite the status code.
                            Status code value will be use as fallback when renders status code template does not result in a valid HTTP status code number
                        </Typography>
                        <Typography paragraph>
                            The rendering order of the response templates is: status code template, body and headers.
                            In this way, for example, headers and body could use the result of rendering the status code template in status code field and headers cloud use a rendered response body.
                        </Typography>
                        <Typography paragraph>
                            Request inbox templates are based on <ExternalLink href="https://pkg.go.dev/text/template">Golang templates</ExternalLink>.
                            The documentation is wide and this manual will provide some examples.
                        </Typography>
                        <Typography>
                            Inbox and Request are variables available to use, both refers to the current inbox and request and have the same structure as they have in the REST API.
                        </Typography>
                        <Typography>
                            In adition to <ExternalLink href="https://pkg.go.dev/text/template">Golang templates</ExternalLink> features,
                            the following functions have been implemented
                            <List>
                                <ListItem>
                                    <ListItemText primary="gjsonPath" secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                Search values in a json document with a GJSON Path.
                                                If the path is not found then the value is  <code>&lt;no value&gt;</code>
                                            </Typography>
                                            <Typography sx={{ mt: 0.1 }}>
                                                Example
                                                <Paper >
                                                    <code>
                                                        {'{{ gjsonPath .Request.Body "path" }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                            <Typography>
                                                For more information about GJSON Path syntax expresions check <ExternalLink href="https://github.com/tidwall/gjson/blob/master/SYNTAX.md">gjsonpath sintax</ExternalLink>
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="gjsonPathOrDefault" secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                Same as GJSON Path but it provides a way to set a fallback value
                                            </Typography>
                                            <Typography sx={{ mt: 0.1 }}>
                                                Example
                                                <Paper >
                                                    <code>
                                                        {'{{ gjsonPathOrDefault .Request.Body "Path" "default" }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="toUpper" secondary={
                                        <React.Fragment>
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
                                                <Paper >
                                                    <code>
                                                        {'{{ toUpper "this will be in upper case"}}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>


                                <ListItem>
                                    <ListItemText primary="toLower" secondary={
                                        <React.Fragment>
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
                                                <Paper >
                                                    <code>
                                                        {'{{ toLower "THIS WILL BE IN LOWER CASE"}}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>


                                <ListItem>
                                    <ListItemText primary="split" secondary={
                                        <React.Fragment>
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
                                                <Paper >
                                                    <code>
                                                        {'{{ split "1,2,3" ","}}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="trimSpace" secondary={
                                        <React.Fragment>
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
                                                <Paper >
                                                    <code>
                                                        {'{{ trimSpace " a string with spaces at the beginning and at end  " }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="currentTimestampSeconds" secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                Get the current timestamp in seconds
                                            </Typography>
                                            <Typography sx={{ mt: 0.1 }}>
                                                Example
                                                <Paper >
                                                    <code>
                                                        {'{{ currentTimestampSeconds }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="now" secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                Get the current date and time with 2006-01-02 15:04:05 format
                                            </Typography>
                                            <Typography sx={{ mt: 0.1 }}>
                                                Example
                                                <Paper >
                                                    <code>
                                                        {'{{ now }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="today" secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                Get the current date with 2006-01-02 format
                                            </Typography>
                                            <Typography sx={{ mt: 0.1 }}>
                                                Example
                                                <Paper >
                                                    <code>
                                                        {'{{ today }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="randomString" secondary={
                                        <React.Fragment>
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
                                                <Paper >
                                                    <code>
                                                        {'{{ randomString 10 }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="randomInt" secondary={
                                        <React.Fragment>
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
                                                <Paper >
                                                    <code>
                                                        {'{{ randomInt 0 10 }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>


                                <ListItem>
                                    <ListItemText primary="randomFloat" secondary={
                                        <React.Fragment>
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
                                                <Paper >
                                                    <code>
                                                        {'{{ randomFloat 0 1 }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="randomBool" secondary={
                                        <React.Fragment>
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
                                                <Paper >
                                                    <code>
                                                        {'{{ randomBool }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="randomUUID" secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                Generates a random UUID as string
                                            </Typography>
                                            <Typography sx={{ mt: 0.1 }}>
                                                Example
                                                <Paper >
                                                    <code>
                                                        {'{{ randomUUID }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="intAdd" secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                Sum two integers values
                                            </Typography>
                                            <Typography sx={{ mt: 0.1 }}>
                                                Example
                                                <Paper >
                                                    <code>
                                                        {'{{ intAdd 2 2 }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="intSubtract" secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                It performs subtraction on two integer values
                                            </Typography>
                                            <Typography sx={{ mt: 0.1 }}>
                                                Example
                                                <Paper >
                                                    <code>
                                                        {'{{ intSubtract 2 2 }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary="stringToInt" secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                Converts a string representing an integer into an actual integer value.
                                                It if fails return 0 as intenger
                                            </Typography>
                                            <Typography sx={{ mt: 0.1 }}>
                                                Example
                                                <Paper >
                                                    <code>
                                                        {'{{ $n:= stringToInt .Inbox.Response.Body }}'}
                                                    </code>
                                                </Paper >
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>


                            </List>
                        </Typography>
                        <Typography>
                            More functions can be added in the future.
                        </Typography>



                    </AccordionDetails>
                </Accordion>



            </Box >
            <Footer />
        </Container >
    );
};


export default UsersManualPage;