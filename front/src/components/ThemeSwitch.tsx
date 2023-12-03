import React from 'react';
import { Switch, SvgIcon } from '@mui/material';
import { useCustomTheme } from '../theme';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import BedtimeIcon from '@mui/icons-material/Bedtime';

const ThemeSwitch = () => {
    const { toggleTheme, isDarkMode } = useCustomTheme();
    const nightIconStyle = {
        transform: 'translate(4px, -3px)',
    };
    const dayIconStyle = {
        transform: 'translate(-3px, -2px)',
    };
    return (

        < Switch
            checked={isDarkMode}
            onChange={toggleTheme}
            icon={<SvgIcon style={dayIconStyle}>< WbSunnyIcon /></SvgIcon>}
            checkedIcon={<SvgIcon style={nightIconStyle}>< BedtimeIcon /></SvgIcon>} />
    );
};
export default ThemeSwitch;
