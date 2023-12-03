import { Typography, Container, Box } from '@mui/material';

export default function Footer() {
    return (
        <footer>
            <Box component="footer" bgcolor="background.paper" py={2} textAlign="center">
                <Container maxWidth="sm">
                    <Typography>© 2023 Jesusnoseq. Licensed under the [Apache License, Version 2.0](https://github.com/jesusnoseq/request-inbox/blob/main/LICENSE).</Typography>
                </Container>
            </Box>
        </footer>
    );
}