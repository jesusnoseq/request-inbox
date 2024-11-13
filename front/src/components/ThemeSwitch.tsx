import React from 'react';
import { Switch, SvgIcon, Tooltip } from '@mui/material';
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
    const title = "Change to " + (isDarkMode ? "light" : "dark") + " theme";
    return (
        <Tooltip title={title}>
            <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                icon={<SvgIcon style={dayIconStyle}><WbSunnyIcon /></SvgIcon>}
                checkedIcon={<SvgIcon style={nightIconStyle}><BedtimeIcon /></SvgIcon>} />
        </Tooltip>
    );
};
export default ThemeSwitch;
