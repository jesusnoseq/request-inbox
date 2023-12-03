import { Typography, Container, Box } from '@mui/material';

export default function Footer() {
    return (
        <footer>
            <Box component="footer" bgcolor="background.paper" py={2} textAlign="center">
                <Container maxWidth="sm">
                    <Typography>© 2023 Jesusnoseq. Licensed under the <a href='https://github.com/jesusnoseq/request-inbox/blob/main/LICENSE'>Apache License, Version 2.0</a>.</Typography>
                </Container>
            </Box>
        </footer>
    );
}