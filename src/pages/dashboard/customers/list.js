import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Divider, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import toast from 'react-hot-toast';
import { DashPage, StatusPill } from 'src/components/ctmass-ui';
import { customersApi } from 'src/api/customers';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { CustomerListSearch } from 'src/sections/dashboard/customer/customer-list-search';
import { CustomerListTable, ROWS_PER_PAGE_OPTIONS } from 'src/sections/dashboard/customer/customer-list-table';
import { CustomerBulkEmailDialog } from 'src/sections/dashboard/customer/customer-bulk-email-dialog';

const STATE_KEY = 'dashboard.customers.listState';
const SCROLL_KEY = 'dashboard.customers.scrollY';

const DEFAULT_STATE = {
  filters: {
    query: undefined,
    CUSTOMER: undefined,
    WORKER: undefined,
    TESTER: undefined
  },
  page: 0,
  rowsPerPage: 10,
  sortBy: 'registrationAt',
  sortDir: 'desc'
};

const readSession = (key) => {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const writeSession = (key, value) => {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(e);
  }
};

const useCustomersSearch = () => {
  const [state, setState] = useState(() => {
    const saved = readSession(STATE_KEY);
    if (!saved) {
      return DEFAULT_STATE;
    }
    return {
      ...DEFAULT_STATE,
      ...saved,
      filters: { ...DEFAULT_STATE.filters, ...saved.filters },
      rowsPerPage: ROWS_PER_PAGE_OPTIONS.includes(saved.rowsPerPage)
        ? saved.rowsPerPage
        : DEFAULT_STATE.rowsPerPage
    };
  });

  useEffect(() => {
    writeSession(STATE_KEY, state);
  }, [state]);

  const handleFiltersChange = useCallback((filters) => {
    setState((prevState) => ({
      ...prevState,
      filters,
      page: 0
    }));
  }, []);

  const handleSortChange = useCallback((sort) => {
    setState((prevState) => ({
      ...prevState,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir,
      page: 0
    }));
  }, []);

  const handlePageChange = useCallback((event, page) => {
    setState((prevState) => ({
      ...prevState,
      page
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state
  };
};

const useCustomersStore = (searchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState({
    customers: [],
    customersCount: 0,
    loaded: false
  });

  const handleCustomersGet = useCallback(async () => {
    try {
      const response = await customersApi.getCustomers(searchState);

      if (isMounted()) {
        setState({
          customers: response.data,
          customersCount: response.count,
          loaded: true
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(() => {
    handleCustomersGet();
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]);

  const searchStateRef = useRef(searchState);
  searchStateRef.current = searchState;

  useEffect(() => {
    if (!customersApi.hasCache()) {
      return;
    }

    customersApi.loadProfiles(true)
      .then(() => customersApi.getCustomers(searchStateRef.current))
      .then((response) => {
        if (isMounted()) {
          setState({
            customers: response.data,
            customersCount: response.count,
            loaded: true
          });
        }
      })
      .catch((err) => console.error(err));
  }, [isMounted]);

  return state;
};

const useScrollRestore = (ready) => {
  const restoredRef = useRef(false);

  useLayoutEffect(() => {
    if (!ready || restoredRef.current) return undefined;
    restoredRef.current = true;
    const savedY = readSession(SCROLL_KEY);
    if (!savedY) return undefined;

    const apply = () => window.scrollTo(0, savedY);
    apply();
    const raf = window.requestAnimationFrame(apply);
    const timer = window.setTimeout(apply, 200);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [ready]);

  return useCallback(() => {
    writeSession(SCROLL_KEY, window.scrollY);
  }, []);
};

const useSelection = () => {
  const [selected, setSelected] = useState(() => new Map());

  const toggle = useCallback((customer) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(customer.id)) {
        next.delete(customer.id);
      } else {
        next.set(customer.id, customer);
      }
      return next;
    });
  }, []);

  const setMany = useCallback((customers, checked) => {
    setSelected((prev) => {
      const next = new Map(prev);
      customers.forEach((customer) => {
        if (checked) {
          next.set(customer.id, customer);
        } else {
          next.delete(customer.id);
        }
      });
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Map()), []);

  const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);
  const recipients = useMemo(() => Array.from(selected.values()), [selected]);

  return { selectedIds, recipients, toggle, setMany, clear };
};

const SelectionBar = ({ selectedCount, matchingCount, onSelectAllMatching, onClear, onEmail }) => (
  <>
    <Divider />
    <Stack
      alignItems={{ xs: 'stretch', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={(theme) => ({
        px: { xs: 2, sm: 3 },
        py: 1.5,
        bgcolor: selectedCount ? alpha(theme.palette.primary.main, 0.06) : 'transparent'
      })}
    >
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        columnGap={1}
        rowGap={0.5}
      >
        <Typography variant="subtitle2">
          {selectedCount
            ? `${selectedCount.toLocaleString('en-US')} selected`
            : 'Select users to send them a group email'}
        </Typography>
        {matchingCount > 0 && (
          <Button
            onClick={onSelectAllMatching}
            size="small"
          >
            Select all {matchingCount.toLocaleString('en-US')} in this list
          </Button>
        )}
        {selectedCount > 0 && (
          <Button
            color="inherit"
            onClick={onClear}
            size="small"
          >
            Clear
          </Button>
        )}
      </Stack>
      <Box>
        <Button
          disabled={!selectedCount}
          fullWidth
          onClick={onEmail}
          startIcon={<MailOutlineIcon />}
          variant="contained"
        >
          Email selected
        </Button>
      </Box>
    </Stack>
  </>
);

const Page = () => {
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomersStore(customersSearch.state);

  const handleItemOpen = useScrollRestore(customersStore.loaded);
  const selection = useSelection();
  const { setMany: selectMany, clear: clearSelection } = selection;
  const [emailOpen, setEmailOpen] = useState(false);
  usePageView();

  const { filters, sortBy, sortDir } = customersSearch.state;
  const handleSelectAllMatching = useCallback(async () => {
    try {
      const response = await customersApi.getCustomers({ filters, sortBy, sortDir });
      selectMany(response.data, true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to select users');
    }
  }, [filters, sortBy, sortDir, selectMany]);

  const handleEmailClose = useCallback((outcome) => {
    setEmailOpen(false);
    if (outcome) {
      clearSelection();
      selectMany(outcome.remaining, true);
    }
  }, [clearSelection, selectMany]);

  return (
    <>
      <Seo title="Customers" />
      <DashPage
        title="Customers"
        badge={customersStore.loaded ? <StatusPill tone="navy">{customersStore.customersCount.toLocaleString('en-US')}</StatusPill> : null}
        subtitle="Everyone registered on CTMASS. Search, sort and open a profile."
      >
        <Card sx={{ overflow: 'hidden' }}>
          <CustomerListSearch
            filters={customersSearch.state.filters}
            onFiltersChange={customersSearch.handleFiltersChange}
            onSortChange={customersSearch.handleSortChange}
            sortBy={customersSearch.state.sortBy}
            sortDir={customersSearch.state.sortDir}
          />
          <SelectionBar
            matchingCount={customersStore.loaded ? customersStore.customersCount : 0}
            onClear={selection.clear}
            onEmail={() => setEmailOpen(true)}
            onSelectAllMatching={handleSelectAllMatching}
            selectedCount={selection.selectedIds.size}
          />
          <CustomerListTable
            count={customersStore.customersCount}
            items={customersStore.customers}
            loaded={customersStore.loaded}
            onItemOpen={handleItemOpen}
            onPageChange={customersSearch.handlePageChange}
            onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
            page={customersSearch.state.page}
            rowsPerPage={customersSearch.state.rowsPerPage}
            selectedIds={selection.selectedIds}
            onToggle={selection.toggle}
            onTogglePage={selection.setMany}
          />
        </Card>
        <CustomerBulkEmailDialog
          onClose={handleEmailClose}
          open={emailOpen}
          recipients={selection.recipients}
        />
      </DashPage>
    </>
  );
};

export default Page;
