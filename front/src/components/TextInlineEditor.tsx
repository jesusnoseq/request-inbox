import React, { useState, useEffect } from 'react';
import { TextField, Box, IconButton, Typography, InputAdornment, ButtonGroup } from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';


type TextInlineEditorProps = {
    initialValue: string;
    label: string;
    readonly: boolean;
    onSave: (val: string) => void;
};



const TextInlineEditor: React.FC<TextInlineEditorProps> = ({ initialValue, label, readonly, onSave }) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const [previousValue, setPreviousValue] = useState<string>(initialValue);
    const [value, setValue] = useState<string>(initialValue);
    const [error, setError] = useState(false);

    const enableEditMode = () => {
        setEditMode(true);
        setPreviousValue(value);
    };

    const handleBodyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    useEffect(() => {
        setError(value.trim() === '');
    }, [value]);

    const handleSave = () => {
        setEditMode(false);
        onSave(value);
    }
    const handleCancel = () => {
        setValue(previousValue);
        setEditMode(false);
    }

    return (
        <>
            {!editMode &&
                <Box display="flex" alignItems="start" gap={1}>
                    <Typography variant="h4" gutterBottom sx={{
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word'
                    }}>
                        {label}  {value}
                    </Typography>
                    {!readonly &&
                        <IconButton aria-label="edit inbox name" size="small" onClick={enableEditMode}>
                            <ModeEditIcon fontSize="large" />
                        </IconButton>
                    }
                </Box >
            }
            {
                editMode &&
                <TextField
                    size="medium"
                    value={value}
                    onChange={handleBodyChange}
                    autoFocus
                    fullWidth
                    required
                    error={error}
                    InputProps={{
                        sx: {
                            fontSize: '2rem',
                            pl: 1,
                            m: 0,
                            height: '1.68em'
                        },
                        startAdornment: (
                            <InputAdornment position="start">
                                <span style={{ fontSize: '2rem' }}>Inbox</span>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <>
                                < InputAdornment position="end" >
                                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                                        <IconButton aria-label="Cancel" size="small" onClick={handleCancel}>
                                            <ClearIcon fontSize="medium" />
                                        </IconButton>
                                        <IconButton aria-label="Save" size="small" onClick={handleSave} disabled={error}>
                                            <DoneIcon fontSize="medium" />
                                        </IconButton>
                                    </ButtonGroup>
                                </InputAdornment >
                            </>
                        )
                    }}
                />
            }
        </>
    );
}

export default TextInlineEditor