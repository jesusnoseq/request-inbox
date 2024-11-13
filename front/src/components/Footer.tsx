import { Typography, Container, Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExternalLink from '../components/ExternalLink';

export default function Footer() {
    return (
        <footer>
            <Box component="footer" bgcolor="background.paper" py={2} textAlign="center">
                <Container maxWidth="sm">
                    <Typography>© 2024&nbsp;
                        <ExternalLink href="https://jesusnoseq.com/">Jesusnoseq</ExternalLink>.
                        Licensed under the <ExternalLink href='https://github.com/jesusnoseq/request-inbox/blob/main/LICENSE'>Apache License, Version 2.0</ExternalLink>.
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center">
                        <Link component={RouterLink} to="/terms">
                            Terms of Service
                        </Link>
                        {' | '}
                        <Link component={RouterLink} to="/privacy">
                            Privacy Policy
                        </Link>
                        {' | '}
                        <Link component={RouterLink} to="/cookies">
                            Cookie Policy
                        </Link>
                    </Typography>
                </Container>
            </Box>
        </footer>
    );
}