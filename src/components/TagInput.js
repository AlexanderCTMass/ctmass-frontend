import { useState, useEffect, useMemo, forwardRef } from 'react';
import {
    Autocomplete,
    TextField,
    CircularProgress,
    Popper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { debounce } from 'lodash';
import { profileApi } from 'src/api/profile';

const StyledPopper = props => <Popper {...props} sx={{ width: 300 }} />;

const TagInput = forwardRef(({ value, onChange, ...rest }, ref) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const commitIfComma = (str) => {
        if (str.endsWith(',')) {
            pushTag(str.slice(0, -1));
            setInputValue('');
            setOpen(false);
            return true;
        }
        return false;
    };

    const fetch = useMemo(() => debounce(async (q) => {
        if (q.length < 3) return setOptions([]);
        setLoading(true);
        try {
            setOptions(await profileApi.getTagStats(q));
            setOpen(true);
        } finally { setLoading(false); }
    }, 250), []);

    useEffect(() => () => fetch.cancel(), [fetch]);

    const pushTag = (tag) => {
        const next = tag.trim().toLowerCase();
        if (!next) return;
        if (value.includes(next)) return;
        onChange([...value, next]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (commitIfComma(inputValue) || !inputValue.trim()) return;
            pushTag(inputValue);
            setInputValue('');
            setOpen(false);
        }

        if (e.key === 'Backspace' && inputValue === '') {
            e.stopPropagation();
        }
    };

    const handleAddClick = () => {
        if (commitIfComma(inputValue)) return;
        if (!inputValue.trim()) return;
        pushTag(inputValue);
        setInputValue('');
        setOpen(false);
    };

    return (
        <Autocomplete
            ref={ref}
            multiple
            freeSolo
            disableCloseOnSelect
            clearOnBlur
            filterSelectedOptions
            open={open}
            onClose={() => setOpen(false)}
            value={value}
            options={options}
            getOptionLabel={(o) => (typeof o === 'string' ? o : o.tag)}
            PopperComponent={StyledPopper}
            clearIcon={<AddIcon fontSize="small" />}
            componentsProps={{
                clearIndicator: {
                    onMouseDown: (e) => e.preventDefault(),
                    onClick: (e) => {
                        e.stopPropagation();
                        handleAddClick();
                    },
                    sx: { cursor: 'pointer' }
                }
            }}
            onChange={(_, newVal, reason) => {
                if (reason === 'selectOption') {
                    const selected = newVal[newVal.length - 1];
                    pushTag(typeof selected === 'string' ? selected : selected.tag);
                    setInputValue('');
                    setOpen(false);
                } else {
                    onChange(newVal.map((t) => (typeof t === 'string' ? t : t.tag)));
                }
            }}
            renderTags={(tags, getTagProps) =>
                tags.map((t, i) => (
                    <span key={t} {...getTagProps({ index: i })} />
                ))
            }
            renderOption={(props, opt) => (
                <li {...props} key={opt.tag}>
                    {opt.tag} — {opt.count} specialists
                </li>
            )}
            inputValue={inputValue}
            onInputChange={(_, newInput) => {
                if (commitIfComma(newInput)) return;
                setInputValue(newInput);
                fetch(newInput);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Type tag and hit Enter “,” or +"
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading && (
                                    <CircularProgress size={18} sx={{ mr: 0.5 }} />
                                )}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                    {...rest}
                />
            )}
        />
    );
});
export default TagInput;