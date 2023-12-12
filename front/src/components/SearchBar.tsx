import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

type SearchBarProps = {
    onChange?: (id: string) => void;
    onSearch?: (id: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ onChange, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        onChange?.(event.target.value);
    };
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
        if (event.key === 'Escape') {
            clearSearch();
        }
    };
    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
        onSearch?.(searchTerm);
    };

    const clearSearch = () => {
        setSearchTerm("");
        onChange?.("");
    };

    return (
        <TextField
            size="small"
            variant="outlined"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
                endAdornment: (searchTerm !== "" &&
                    <InputAdornment position="end">
                        <IconButton onClick={clearSearch} aria-label="search">
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default SearchBar;