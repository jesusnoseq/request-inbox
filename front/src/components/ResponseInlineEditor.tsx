import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InboxResponse } from '../types/inbox';
import {
    TextField, Box, FormControl, FormControlLabel, FormGroup, IconButton, Typography, Button,
    InputAdornment, TextareaAutosize, Switch, Tooltip, Autocomplete, Collapse
} from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import BodyView from './BodyView';
import HeadersEditor, { Header, convertRecordToHeaders, convertHeadersToRecord } from './HeadersEditor';
import StatusChip from './StatusChip';
import { monoFontFamily } from '../theme';

type ResponseInlineEditorProps = {
    response: InboxResponse;
    onSave: (resp: InboxResponse) => void | Promise<void>;
    readonly: boolean
};

type StatusCodeOption = { code: number; text: string };

const STATUS_CODES: StatusCodeOption[] = [
    { code: 100, text: 'Continue' },
    { code: 101, text: 'Switching Protocols' },
    { code: 200, text: 'OK' },
    { code: 201, text: 'Created' },
    { code: 202, text: 'Accepted' },
    { code: 204, text: 'No Content' },
    { code: 301, text: 'Moved Permanently' },
    { code: 302, text: 'Found' },
    { code: 304, text: 'Not Modified' },
    { code: 400, text: 'Bad Request' },
    { code: 401, text: 'Unauthorized' },
    { code: 403, text: 'Forbidden' },
    { code: 404, text: 'Not Found' },
    { code: 405, text: 'Method Not Allowed' },
    { code: 408, text: 'Request Timeout' },
    { code: 409, text: 'Conflict' },
    { code: 410, text: 'Gone' },
    { code: 422, text: 'Unprocessable Entity' },
    { code: 429, text: 'Too Many Requests' },
    { code: 500, text: 'Internal Server Error' },
    { code: 501, text: 'Not Implemented' },
    { code: 502, text: 'Bad Gateway' },
    { code: 503, text: 'Service Unavailable' },
    { code: 504, text: 'Gateway Timeout' },
];

const ResponseInlineEditor: React.FC<ResponseInlineEditorProps> = ({ response, onSave, readonly }) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [headers, setHeaders] = useState<Header[]>(convertRecordToHeaders(response.Headers));
    const [body, setBody] = useState<string>(response.Body);
    const [isDynamic, setIsDynamic] = useState<boolean>(response.IsDynamic);
    const [statusCode, setStatusCode] = useState<number>(response.Code);
    const [statusCodeInput, setStatusCodeInput] = useState<string>(response.Code.toString());
    const [statusCodeTemplate, setStatusCodeTemplate] = useState<string>(response.CodeTemplate || response.Code.toString());
    const [statusCodeError, setStatusCodeError] = useState<boolean>(false);
    const [errors, setErrors] = useState<boolean>(false);
    const navigate = useNavigate();

    const enableEditMode = () => {
        setEditMode(true);
    };

    const saveResponse = (resp: InboxResponse) => {
        setStatusCode(resp.Code);
        setStatusCodeInput(resp.Code.toString());
        setStatusCodeTemplate(resp.CodeTemplate);
        setHeaders(convertRecordToHeaders(resp.Headers));
        setBody(resp.Body);
        setIsDynamic(resp.IsDynamic);
        setEditMode(false);
        return Promise.resolve().then(() => onSave(resp)).then(() => ({
            code: resp.Code,
            codeTemplate: resp.CodeTemplate,
            body: resp.Body,
            headers: resp.Headers,
            isDynamic: resp.IsDynamic,
        }));
    };

    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const update = Promise.resolve().then(() => {
            const headersValue = String(formData.get('headers') ?? '{}');
            const parsedHeaders: unknown = JSON.parse(headersValue);
            if (!parsedHeaders || Array.isArray(parsedHeaders) || typeof parsedHeaders !== 'object'
                || Object.values(parsedHeaders).some((value) => typeof value !== 'string')) {
                throw new Error('headers must be a JSON object with string values.');
            }

            return saveResponse({
                Body: String(formData.get('body') ?? ''),
                Code: Number(formData.get('code')),
                CodeTemplate: String(formData.get('codeTemplate') ?? ''),
                Headers: parsedHeaders as Record<string, string>,
                IsDynamic: (form.elements.namedItem('isDynamic') as HTMLInputElement).checked,
            });
        });
        const submitEvent = event.nativeEvent as SubmitEvent;

        if (submitEvent.agentInvoked && submitEvent.respondWith) {
            submitEvent.respondWith(update);
        } else {
            void update.catch(() => undefined);
        }
    };

    const handleCancel = () => {
        setStatusCode(response.Code);
        setStatusCodeInput(response.Code.toString());
        setStatusCodeTemplate(response.CodeTemplate || response.Code.toString());
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

    const handleStatusCodeInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
        setStatusCodeInput(newInputValue);
        const trimmed = newInputValue.trim();
        if (/^\d{1,3}$/.test(trimmed)) {
            setStatusCode(parseInt(trimmed, 10));
            setStatusCodeError(false);
        }
    };

    const handleStatusCodeOptionChange = (_event: React.SyntheticEvent, value: StatusCodeOption | string | null) => {
        if (value && typeof value !== 'string') {
            setStatusCode(value.code);
            setStatusCodeInput(String(value.code));
            setStatusCodeError(false);
        }
    };

    const handleStatusCodeBlur = () => {
        const trimmed = statusCodeInput.trim();
        if (!/^\d{1,3}$/.test(trimmed) || parseInt(trimmed, 10) < 100) {
            setStatusCodeError(true);
        }
        setStatusCodeInput(statusCode.toString());
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

    const contentTypeHeader = headers.find((h) => h.key.toLowerCase() === 'content-type');

    return (
        <>
            {!editMode &&
                <Box sx={{ mb: 2 }}>
                    <Box
                        onClick={() => setExpanded(!expanded)}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={1}
                        sx={{
                            cursor: 'pointer',
                            p: 1.5,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: expanded ? '4px 4px 0 0' : 1,
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" minWidth={0}>
                            <Typography variant="h6">
                                Response
                            </Typography>
                            <StatusChip code={statusCode} />
                            {contentTypeHeader &&
                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: monoFontFamily }} noWrap>
                                    {contentTypeHeader.value}
                                </Typography>
                            }
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                            {!readonly &&
                                <IconButton
                                    aria-label="edit response"
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); enableEditMode(); }}
                                >
                                    <ModeEditIcon fontSize="medium" />
                                </IconButton>
                            }
                            <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', color: 'text.secondary' }} />
                        </Box>
                    </Box>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Paper variant="outlined" sx={{ p: 2, borderTop: 0, borderRadius: '0 0 4px 4px' }}>
                            {isDynamic &&
                                <Box sx={{ mb: 3 }}>
                                    <Typography color="textSecondary" sx={{ mb: 1 }}>
                                        Status code template
                                    </Typography>
                                    {statusCodeTemplate}
                                </Box>
                            }

                            {headers.length !== 0 &&
                                <Box sx={{ mb: 3 }}>
                                    <Typography color="textSecondary" sx={{ mb: 1 }}>
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
                                </Box>
                            }
                            <Box>
                                <Typography color="textSecondary" sx={{ mb: 1 }}>
                                    Body
                                </Typography>
                                <BodyView data={body} />
                            </Box>
                        </Paper>
                    </Collapse>
                </Box >
            }
            {!readonly && <form
                aria-label="Update request inbox response"
                toolname="update_request_inbox_response"
                tooltitle="Update Request Inbox Response"
                tooldescription="Use this form when the user asks to change the HTTP response returned by the open request inbox. It persists the status code, body, complete header map, and dynamic-template mode."
                toolautosubmit=""
                onSubmit={handleSave}
                style={{ display: editMode ? 'block' : 'none', marginBottom: '16px' }}
            >
                <input
                    hidden
                    name="code"
                    type="number"
                    min="100"
                    max="999"
                    value={statusCode}
                    readOnly
                    required
                    toolparamdescription="Static HTTP status code from 100 through 999."
                />
                <textarea
                    hidden
                    name="codeTemplate"
                    value={statusCodeTemplate}
                    readOnly
                    toolparamdescription="Optional Go template that renders an HTTP status code in dynamic mode."
                />
                <textarea
                    hidden
                    name="headers"
                    value={JSON.stringify(convertHeadersToRecord(headers))}
                    readOnly
                    required
                    toolparamdescription="Complete response headers as a JSON object whose values are strings."
                />
                <textarea
                    hidden
                    name="body"
                    value={body}
                    readOnly
                    toolparamdescription="Complete HTTP response body. In dynamic mode it is rendered as a Go template."
                />
                <input
                    hidden
                    name="isDynamic"
                    type="checkbox"
                    checked={isDynamic}
                    readOnly
                    toolparamdescription="Whether body, headers, and the optional code template are rendered as Go templates."
                />
                <Box>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6">
                            Manage Response
                        </Typography>
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <FormControl fullWidth sx={{ m: 1 }}>
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', flexGrow: 1, flexWrap: 'wrap', gap: 3 }}>
                                    <Autocomplete
                                        freeSolo
                                        options={STATUS_CODES}
                                        getOptionLabel={(option) => typeof option === 'string' ? option : `${option.code} ${option.text}`}
                                        filterOptions={(options, state) => {
                                            const q = state.inputValue.trim().toLowerCase();
                                            const filtered = !q ? options : options.filter((o) =>
                                                String(o.code).indexOf(q) !== -1 || o.text.toLowerCase().indexOf(q) !== -1
                                            );
                                            return filtered.slice(0, 8);
                                        }}
                                        inputValue={statusCodeInput}
                                        onInputChange={handleStatusCodeInputChange}
                                        onChange={handleStatusCodeOptionChange}
                                        onBlur={handleStatusCodeBlur}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <StatusChip code={option.code} />
                                                <Typography variant="body2">{option.text}</Typography>
                                            </Box>
                                        )}
                                        sx={{ width: '22ch' }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                required
                                                label="Status code"
                                                variant="standard"
                                                error={statusCodeError}
                                                helperText={statusCodeError ? 'Enter a valid status code' : 'Search by code or name'}
                                                slotProps={{
                                                    inputLabel: {
                                                        color: "primary",
                                                        sx: { fontSize: '1.25rem' },
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                    {
                                        isDynamic &&

                                        <TextField
                                            sx={{ minWidth: "30ch", flexGrow: 1 }}
                                            required
                                            id="status-code-template"
                                            label="Status code template"
                                            variant="standard"
                                            value={statusCodeTemplate.toString()}
                                            onChange={handleStatusCodeTemplateChange}
                                            size='medium'
                                            slotProps={{
                                                input: {
                                                    inputComponent: TextareaAutosize,
                                                    inputProps: {
                                                        minRows: 1,
                                                        style: { resize: 'none' }, // Prevent manual resizing
                                                    },
                                                },
                                                inputLabel: {
                                                    color: "primary",
                                                    sx: { fontSize: '1.25rem' },
                                                }
                                            }}
                                        />
                                    }
                                </Box>
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1">
                                    Headers
                                </Typography>
                                <HeadersEditor initialHeaders={headers} onHeadersChange={setHeaders} />
                            </Box>

                            <Box>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    Body
                                </Typography>
                                <TextField
                                    id="outlined-multiline-flexible"
                                    multiline
                                    fullWidth
                                    variant="standard"
                                    rows={3}
                                    value={body}
                                    onChange={handleBodyChange}
                                    slotProps={{
                                        input: {
                                            inputComponent: TextareaAutosize,
                                            inputProps: {
                                                minRows: 3,
                                                style: { resize: 'none' }, // Prevent manual resizing
                                            },
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Button onClick={formatAsJson} variant="outlined" size="small">
                                                        Format as JSON
                                                    </Button>
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                />
                            </Box>
                            <FormGroup row sx={{ mt: 1 }}>
                                <FormControlLabel
                                    control={<Switch
                                        checked={isDynamic}
                                        onChange={handleIsDynamicToggle}
                                    />}
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
                    </Paper>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={handleCancel}
                            type="button"
                            variant="outlined"
                            sx={{ mr: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={errors}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </form>}
        </>
    );
};

export default ResponseInlineEditor;
