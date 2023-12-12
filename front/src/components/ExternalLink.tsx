import { Link } from '@mui/material';
import { ReactNode } from 'react';


interface ExternalLinkProps {
    href: string;
    children?: ReactNode;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => {
    return (
        <Link href={href} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover">{children ? children : href}</Link>
    );
}



export default ExternalLink;