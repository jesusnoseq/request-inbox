import { Typography, Container, Box } from '@mui/material';
import ExternalLink from '../components/ExternalLink';

export default function Footer() {
    return (
        <footer>
            <Box component="footer" bgcolor="background.paper" py={2} textAlign="center">
                <Container maxWidth="sm">
                    <Typography>© 2023&nbsp;
                        <ExternalLink href="https://jesusnoseq.com/">Jesusnoseq</ExternalLink>.
                        Licensed under the <ExternalLink href='https://github.com/jesusnoseq/request-inbox/blob/main/LICENSE'>Apache License, Version 2.0</ExternalLink>.
                    </Typography>
                </Container>
            </Box>
        </footer>
    );
}