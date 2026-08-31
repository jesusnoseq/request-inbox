import { Container } from '@mui/material';
import Privacy from '../../components/legal/Privacy';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <Privacy />
        </Container>
    );
}


export default PrivacyPolicyPage;
