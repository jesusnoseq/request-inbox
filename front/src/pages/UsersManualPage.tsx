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
                                                For more information about GJSON Path syntax expresions check <ExternalLink href="https://github.com/tidwall/gjson/blob/master/SYNTAX.md">jsonpath sintax</ExternalLink>
                                            </Typography>
                                        </React.Fragment>
                                    } />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="jsonPathOrDefault" secondary={
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
                            </List>
                        </Typography>
                        <Typography>
                            More functions can be aded in the future.
                        </Typography>



                    </AccordionDetails>
                </Accordion>



            </Box >
            <Footer />
        </Container >
    );
};


export default UsersManualPage;