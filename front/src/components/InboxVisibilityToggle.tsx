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
        <>
            <Tooltip
                title={isPublic ?
                    "Any user can view this page." :
                    "Other users cannot view this page."
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
            </Tooltip >
        </>
    )
}