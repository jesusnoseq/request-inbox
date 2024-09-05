import React from "react";
import { Box, Typography, Link, Button } from "@mui/material";

const CookiePolicy: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Cookie Policy
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Effective Date: [Insert Date]
            </Typography>
            <Typography variant="body1" paragraph>
                This Cookie Policy explains how [Your Company/Website Name] ("we", "us", or "our") uses cookies and similar technologies on our website [www.yourwebsite.com] ("Website"). We use cookies strictly for login purposes and to provide you with a secure and seamless user experience. By using our Website, you consent to the use of cookies in accordance with this Cookie Policy.
            </Typography>

            <Typography variant="h6" gutterBottom>
                1. What Are Cookies?
            </Typography>
            <Typography variant="body1" paragraph>
                Cookies are small text files that are stored on your device (computer, smartphone, tablet, etc.) when you visit a website. They are widely used to make websites work more efficiently and to provide information to the site owners.
            </Typography>

            <Typography variant="h6" gutterBottom>
                2. Types of Cookies We Use
            </Typography>
            <Typography variant="body1" paragraph>
                We only use <strong>essential cookies</strong> that are necessary for the operation of our Website. These cookies enable core functionalities such as security, network management, and accessibility. You can disable these cookies by changing your browser settings, but this may affect how our Website functions.
            </Typography>

            <Typography variant="body1" paragraph>
                <strong>a. Session Cookies</strong>
                <br />
                <em>Purpose:</em> To manage your login session securely.
                <br />
                <em>Expiry:</em> These cookies are temporary and are deleted from your device once you close your browser.
            </Typography>

            <Typography variant="body1" paragraph>
                <strong>b. Authentication Cookies</strong>
                <br />
                <em>Purpose:</em> To recognize you after you log in and to ensure your data remains secure while navigating our Website.
                <br />
                <em>Expiry:</em> These cookies expire after a short period (e.g., 24 hours) or when you log out.
            </Typography>

            <Typography variant="h6" gutterBottom>
                3. Managing Cookies
            </Typography>
            <Typography variant="body1" paragraph>
                Most web browsers allow you to manage cookies through your browser settings. You can choose to block cookies or delete cookies already stored on your device, but please note that doing so may affect your experience on our Website, and you may not be able to use all the features of our services.
            </Typography>

            <Typography variant="body1" paragraph>
                For more information on how to manage cookies, please visit the following links based on your browser:
                <ul>
                    <li>
                        <Link href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">
                            Chrome
                        </Link>
                    </li>
                    <li>
                        <Link href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener">
                            Firefox
                        </Link>
                    </li>
                    <li>
                        <Link href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener">
                            Safari
                        </Link>
                    </li>
                    <li>
                        <Link href="https://support.microsoft.com/en-us/help/4468242/microsoft-edge-browsing-data-and-privacy" target="_blank" rel="noopener">
                            Edge
                        </Link>
                    </li>
                </ul>
            </Typography>

            <Typography variant="h6" gutterBottom>
                4. Changes to This Cookie Policy
            </Typography>
            <Typography variant="body1" paragraph>
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our operations. We will notify you of any significant changes by updating the date at the top of this policy or by providing a notice on our Website.
            </Typography>

            <Typography variant="h6" gutterBottom>
                5. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
                If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
                <br />
                <strong>Email:</strong> <Link href="mailto:contact@yourwebsite.com">contact@yourwebsite.com</Link>
                <br />
                <strong>Address:</strong> [Your Company Address]
            </Typography>
        </Box>
    );
};

export default CookiePolicy;
