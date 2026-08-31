import { Container } from '@mui/material';
import CookiePolicy from '../../components/legal/CookiePolicy';

const CookiePolicyPage: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <CookiePolicy />
        </Container>
    );
}


export default CookiePolicyPage;
