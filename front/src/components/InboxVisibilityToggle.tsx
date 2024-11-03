import { FormControlLabel, Switch, styled, Tooltip } from "@mui/material"
import { useState } from "react"

const StyledSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: `${theme.palette.primary.main}1A`,
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
    },
}))

interface InboxVisibilityToggleProps {
    onChange?: (isPublic: boolean) => void
    defaultPublic?: boolean
}

export default function InboxVisibilityToggle({ onChange, defaultPublic = false }: InboxVisibilityToggleProps = {}) {
    const [isPublic, setIsPublic] = useState(defaultPublic)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked
        setIsPublic(newValue)
        onChange?.(newValue)
    }

    return (
        <Tooltip
            title={isPublic ?
                "Make this inbox private.<br/> Other users can not see this page. This change does not affect the collection of requests." :
                "Make this inbox public.<br/> Any user can see this page. This change does not affect the collection of requests."
            }
            placement="top"
            arrow
        >
            <FormControlLabel
                control={
                    <StyledSwitch
                        checked={isPublic}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': 'visibility toggle' }}
                        size="small"
                    />
                }
                label={isPublic ? "Public" : "Private"}
                sx={{
                    marginLeft: 1,
                    '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                        color: 'text.secondary'
                    }
                }}
            />
        </Tooltip>
    )
}