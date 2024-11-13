import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Typography } from '@mui/material';
import { acceptCookies } from '../../services/inbox';

function CookieBanner() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const cookieConsent = localStorage.getItem('cookie_consent');
        if (!cookieConsent) {
            setOpen(true);
        }
    }, []);

    const handleAccept = async () => {
        try {
            await acceptCookies();
            localStorage.setItem('cookie_consent', 'true');
        } catch (error) {
            console.error('Error setting localStorage:', error);
        }
        setOpen(false);
    };

    return (
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={open}
            message={
                <>
                    <Typography variant="body2">
                        We use cookies only for login purposes. By continuing to use this site, you accept our <a href="/cookie-policy">Cookies Policy</a>.
                    </Typography>

                </>
            }
            action={
                <Button size="small" onClick={handleAccept} color="inherit" variant="outlined" >
                    Accept
                </Button>
            }
        />
    );
}

export default CookieBanner;