import { memo, useCallback, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  OutlinedInput,
  Paper,
  SvgIcon,
  Typography,
} from '@mui/material';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import { loyaltyUserAdminApi } from 'src/api/loyalty-user-admin';
import { getRoleColor, getRoleLabel } from './constants';

const UserSearchBar = memo(({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleChange = useCallback(async (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);
    try {
      const found = await loyaltyUserAdminApi.searchUsers(val.trim());
      setResults(found);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = useCallback(
    (user) => {
      setQuery('');
      setResults([]);
      setOpen(false);
      onUserSelect(user);
    },
    [onUserSelect]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => setOpen(false), 150);
  }, []);

  return (
    <Box sx={{ position: 'relative', maxWidth: 500 }}>
      <OutlinedInput
        fullWidth
        value={query}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search by email, business name, or user ID..."
        startAdornment={
          <InputAdornment position="start">
            <SvgIcon fontSize="small">
              <SearchMdIcon />
            </SvgIcon>
          </InputAdornment>
        }
        endAdornment={
          loading ? (
            <InputAdornment position="end">
              <CircularProgress size={16} />
            </InputAdornment>
          ) : null
        }
      />

      {open && results.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 400,
            overflowY: 'auto',
            mt: 0.5,
          }}
        >
          <List disablePadding>
            {results.map((user) => (
              <ListItem
                key={user.id}
                button
                onClick={() => handleSelect(user)}
                sx={{ '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }}
                divider
              >
                <ListItemAvatar>
                  <Avatar src={user.photoURL || undefined} sx={{ width: 36, height: 36 }}>
                    {(user.businessName || user.email || '?')[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {user.businessName || user.displayName || '—'}
                      </Typography>
                      {user.role && (
                        <Chip
                          label={getRoleLabel(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                          sx={{ height: 18, fontSize: 10 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user.email || user.id}
                    </Typography>
                  }
                />
                <Box sx={{ ml: 1, textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="body2" fontWeight={700} color="warning.main">
                    {(user.loyaltyBalance || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    coins
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {open && !loading && query.trim().length >= 2 && results.length === 0 && (
        <Paper
          elevation={8}
          sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300, mt: 0.5, p: 2 }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            No users found
          </Typography>
        </Paper>
      )}
    </Box>
  );
});

UserSearchBar.displayName = 'UserSearchBar';

export default UserSearchBar;
