import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InboxResponse } from '../types/inbox';
import {
    Container, TextField, Box, FormControl, FormControlLabel, FormGroup, IconButton, Typography, Grid, Button,
    ButtonGroup, InputAdornment, TextareaAutosize, Switch, Tooltip
} from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import InfoIcon from '@mui/icons-material/Info';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import BodyView from './BodyView';
import HeadersEditor, { Header, convertRecordToHeaders, convertHeadersToRecord } from './HeadersEditor';

type ResponseInlineEditorProps = {
    response: InboxResponse;
    onSave: (resp: InboxResponse) => void;
    readonly: boolean
};

const ResponseInlineEditor: React.FC<ResponseInlineEditorProps> = ({ response, onSave, readonly }) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const [headers, setHeaders] = useState<Header[]>(convertRecordToHeaders(response.Headers));
    const [body, setBody] = useState<string>(response.Body);
    const [isDynamic, setIsDynamic] = useState<boolean>(response.IsDynamic);
    const [statusCode, setStatusCode] = useState<number>(response.Code);
    const [statusCodeTemplate, setStatusCodeTemplate] = useState<string>(response.CodeTemplate);
    const [statusCodeError, setStatusCodeError] = useState<boolean>(false);
    const [errors, setErrors] = useState<boolean>(false);
    const navigate = useNavigate();

    const enableEditMode = () => {
        setEditMode(true);
    };

    const handleSave = () => {
        setEditMode(false);
        const resp: InboxResponse = {
            Body: body,
            Code: statusCode,
            CodeTemplate: statusCodeTemplate,
            Headers: convertHeadersToRecord(headers),
            IsDynamic: isDynamic
        }
        onSave(resp);
    };

    const handleCancel = () => {
        setStatusCode(response.Code);
        setStatusCodeTemplate(response.CodeTemplate);
        setHeaders(convertRecordToHeaders(response.Headers))
        setBody(response.Body);
        setIsDynamic(response.IsDynamic);
        setEditMode(false);
    };

    const handleBodyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBody(event.target.value);
    };

    const handleStatusCodeTemplateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStatusCodeTemplate(event.target.value);
    };


    const handleIsDynamicToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsDynamic(event.target.checked);
    };

    const handleOpenDynamicResponseDoc = async () => {
        navigate(`/users-manual`);
    };

    const handleStatusCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newStatusCode = parseInt(event.target.value, 10);
        setStatusCodeError(isNaN(newStatusCode) || newStatusCode < 100)
        setStatusCode(newStatusCode || 0);
    };

    useEffect(() => {
        setErrors(statusCodeError);
    }, [statusCodeError]);

    const formatAsJson = () => {
        try {
            const formattedJson = JSON.stringify(JSON.parse(body), null, 2);
            setBody(formattedJson);
        } catch (error) {
            console.error('Invalid JSON input:', error);
        }
    };

    const leftColumnStyle: React.CSSProperties = {
        width: '3em',
        whiteSpace: 'nowrap',
        maxWidth: '20em',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    };

    return (
        <>
            {!editMode &&
                <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        Response
                        {!readonly &&
                            <IconButton aria-label="edit response" size="small" onClick={enableEditMode}>
                                <ModeEditIcon fontSize="medium" />
                            </IconButton>
                        }
                    </Box>
                    <Container>
                        <Box sx={{ display: 'flex', flexGrow: 1 }}>
                            <Box sx={{ width: "12ch", mr: 5 }}>
                                <Typography color="textSecondary">
                                    Status code
                                </Typography>
                                {statusCode}
                            </Box>

                            {isDynamic &&
                                <Box sx={{ mb: 2, minWidth: "30ch", flexGrow: 1 }}>
                                    <Typography color="textSecondary">
                                        Status code template
                                    </Typography>
                                    {statusCodeTemplate}
                                </Box>
                            }
                        </Box>

                        {headers.length !== 0 &&
                            <>
                                <Typography color="textSecondary">
                                    Headers
                                </Typography>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 10 }} size="small" aria-label="a dense table">
                                        <TableBody>
                                            {
                                                headers.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell style={leftColumnStyle}>{item.key}</TableCell>
                                                        <TableCell align='left'>{item.value}</TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        }
                        <BodyView data={body} />

                    </Container>
                </Box >
            }
            {
                editMode &&
                <Box component="form">
                    Response
                    <Container>
                        <FormControl fullWidth sx={{ m: 1 }}>
                            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                                <TextField
                                    sx={{ mb: 2, mr: 5, width: "12ch" }}
                                    required
                                    id="status-code"
                                    label="Status code"
                                    variant="standard"
                                    value={statusCode.toString()}
                                    onChange={handleStatusCodeChange}
                                    size='medium'
                                    error={statusCodeError}
                                    inputProps={{
                                        maxLength: 3,
                                        minLength: 3,
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*',
                                    }}
                                    InputLabelProps={{
                                        color: "primary",
                                        sx: { fontSize: '1.25rem' },
                                    }}
                                />
                                {
                                    isDynamic &&

                                    <TextField
                                        sx={{ mb: 2, minWidth: "30ch", flexGrow: 1 }}
                                        required
                                        id="status-code-template"
                                        label="Status code template"
                                        variant="standard"
                                        value={statusCodeTemplate.toString()}
                                        onChange={handleStatusCodeTemplateChange}
                                        size='medium'
                                        InputProps={{
                                            inputComponent: TextareaAutosize,
                                            inputProps: {
                                                minRows: 1,
                                                style: { resize: 'none' }, // Prevent manual resizing
                                            },
                                        }}
                                        InputLabelProps={{
                                            color: "primary",
                                            sx: { fontSize: '1.25rem' },
                                        }}
                                    />
                                }
                            </Box>
                            Headers
                            <HeadersEditor initialHeaders={headers} onHeadersChange={setHeaders} />

                            <TextField
                                id="outlined-multiline-flexible"
                                label="Body"
                                multiline
                                fullWidth
                                variant="standard"
                                rows={3}
                                value={body}
                                onChange={handleBodyChange}
                                sx={{ mt: 2 }}
                                InputProps={{
                                    inputComponent: TextareaAutosize,
                                    inputProps: {
                                        minRows: 3,
                                        style: { resize: 'none' }, // Prevent manual resizing
                                    },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button onClick={formatAsJson} variant="outlined" size="small" color="secondary">
                                                Format as JSON
                                            </Button>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <FormGroup row sx={{ mt: 1 }}>
                                <FormControlLabel
                                    control={<Switch checked={isDynamic} onChange={handleIsDynamicToggle} />}
                                    label="Dynamic response"
                                />
                                <Tooltip
                                    title="Go to user's manual page and check how dynamic reponses works"
                                    arrow
                                    enterDelay={200}
                                    leaveDelay={300}
                                >
                                    <IconButton onClick={handleOpenDynamicResponseDoc} aria-label="info about dynamic mode">
                                        <InfoIcon />
                                    </IconButton>
                                </Tooltip>
                            </FormGroup>
                        </FormControl>


                        <Grid container justifyContent="flex-end">
                            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                                <IconButton aria-label="Cancel" size="small" onClick={handleCancel}>
                                    <ClearIcon fontSize="medium" />
                                </IconButton>
                                <IconButton aria-label="Save" size="small" onClick={handleSave} disabled={errors}>
                                    <DoneIcon fontSize="medium" />
                                </IconButton>
                            </ButtonGroup>
                        </Grid>
                    </Container>
                </Box >
            }
        </>
    );
};

export default ResponseInlineEditor;