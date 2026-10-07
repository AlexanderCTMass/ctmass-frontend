import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, Card, Container, Stack, Typography } from '@mui/material';
import { customersApi } from 'src/api/customers';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { CustomerListSearch } from 'src/sections/dashboard/customer/customer-list-search';
import { CustomerListTable, ROWS_PER_PAGE_OPTIONS } from 'src/sections/dashboard/customer/customer-list-table';

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

const Page = () => {
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomersStore(customersSearch.state);

  const handleItemOpen = useScrollRestore(customersStore.loaded);
  usePageView();

  return (
    <>
      <Seo title="Dashboard: Customer List" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 3, md: 8 }
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ px: { xs: 1, sm: 3 } }}
        >
          <Stack spacing={{ xs: 2, md: 4 }}>
            <Stack
              alignItems="baseline"
              direction="row"
              spacing={1}
              sx={{ px: { xs: 1, sm: 0 } }}
            >
              <Typography variant="h4">
                Customers
              </Typography>
              {customersStore.loaded && (
                <Typography
                  color="text.secondary"
                  variant="subtitle1"
                >
                  {customersStore.customersCount}
                </Typography>
              )}
            </Stack>
            <Card>
              <CustomerListSearch
                filters={customersSearch.state.filters}
                onFiltersChange={customersSearch.handleFiltersChange}
                onSortChange={customersSearch.handleSortChange}
                sortBy={customersSearch.state.sortBy}
                sortDir={customersSearch.state.sortDir}
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
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
