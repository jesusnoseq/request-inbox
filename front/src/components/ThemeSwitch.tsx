import React from 'react';
import Switch from '@mui/material/Switch';
import { useCustomTheme } from '../theme';

const ThemeSwitch = () => {
    const { toggleTheme, isDarkMode } = useCustomTheme();

    return (
        <Switch checked={isDarkMode} onChange={toggleTheme} />
    );
};
export default ThemeSwitch;
