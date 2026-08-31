import { Container } from '@mui/material';
import TermsOfService from '../../components/legal/TermsOfService';

const TermsOfServicePage: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <TermsOfService />
        </Container>
    );
}


export default TermsOfServicePage;
