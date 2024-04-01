import { Link } from '@mui/material';
import { ReactNode } from 'react';


interface ExternalLinkProps {
    href: string;
    children?: ReactNode;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => {
    const linkStyle = {
        color: 'inherit', // Inherit text color
        transition: 'color 1s', // Smooth transition effect for color change
        '&:hover': {
            color: '#00A', // Change color on hover
        },
    };

    return (
        <Link href={href} target="_blank" rel="noopener noreferrer" color="inherit" underline="always" sx={linkStyle}>
            {children ? children : href}
        </Link>
    );
}



export default ExternalLink;