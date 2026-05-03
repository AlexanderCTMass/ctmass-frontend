import { memo, useCallback } from 'react';
import {
  Box,
  Card,
  InputAdornment,
  OutlinedInput,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import { LOYALTY_CATEGORIES } from './constants';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const LoyaltyFiltersBar = ({ filters, onFiltersChange }) => {
  const handleCategoryChange = useCallback(
    (_, value) => {
      onFiltersChange({ ...filters, category: value });
    },
    [filters, onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (_, value) => {
      if (value !== null) {
        onFiltersChange({ ...filters, status: value });
      }
    },
    [filters, onFiltersChange]
  );

  const handleQueryChange = useCallback(
    (e) => {
      onFiltersChange({ ...filters, query: e.target.value });
    },
    [filters, onFiltersChange]
  );

  return (
    <Card>
      <Box sx={{ px: 2, pt: 2 }}>
        <Tabs
          value={filters.category || 'all'}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="all" />
          {LOYALTY_CATEGORIES.map((cat) => (
            <Tab key={cat.value} label={cat.label} value={cat.value} />
          ))}
        </Tabs>
      </Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        sx={{ p: 2 }}
      >
        <OutlinedInput
          value={filters.query || ''}
          onChange={handleQueryChange}
          fullWidth
          placeholder="Search by name or action key..."
          startAdornment={
            <InputAdornment position="start">
              <SvgIcon fontSize="small">
                <SearchMdIcon />
              </SvgIcon>
            </InputAdornment>
          }
          sx={{ maxWidth: 400 }}
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            Status:
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filters.status || 'all'}
            onChange={handleStatusChange}
          >
            {STATUS_OPTIONS.map((opt) => (
              <ToggleButton key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Stack>
    </Card>
  );
};

export default memo(LoyaltyFiltersBar);
