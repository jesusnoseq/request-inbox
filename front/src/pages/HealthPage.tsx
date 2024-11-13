import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { health } from '../services/inbox';

const AboutPage: React.FC = () => {
    const [data, setData] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            const resp = await health();
            setData(JSON.stringify(resp));
        };

        fetchData();
    }, []);

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Health
                </Typography>
                <Typography>
                    {data}
                </Typography>
            </Box>
        </Container>
    );
};

export default AboutPage;