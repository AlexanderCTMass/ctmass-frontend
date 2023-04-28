import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import { Box, Button, Divider, Stack, SvgIcon, Typography } from '@mui/material';
import { ordersApi } from 'src/api/orders';
import { Seo } from 'src/components/seo';
import { useDialog } from 'src/hooks/use-dialog';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { OrderDrawer } from 'src/sections/dashboard/order/order-drawer';
import { OrderListContainer } from 'src/sections/dashboard/order/order-list-container';
import { OrderListSearch } from 'src/sections/dashboard/order/order-list-search';
import { OrderListTable } from 'src/sections/dashboard/order/order-list-table';

const useOrdersSearch = () => {
  const [state, setState] = useState({
    filters: {
      query: undefined,
      status: undefined
    },
    page: 0,
    rowsPerPage: 5,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  const handleFiltersChange = useCallback((filters) => {
    setState((prevState) => ({
      ...prevState,
      filters
    }));
  }, []);

  const handleSortChange = useCallback((sortDir) => {
    setState((prevState) => ({
      ...prevState,
      sortDir
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
      rowsPerPage: parseInt(event.target.value, 10)
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

const useOrdersStore = (searchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState({
    orders: [],
    ordersCount: 0
  });

  const handleOrdersGet = useCallback(async () => {
    try {
      const response = await ordersApi.getOrders(searchState);

      if (isMounted()) {
        setState({
          orders: response.data,
          ordersCount: response.count
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(() => {
      handleOrdersGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]);

  return {
    ...state
  };
};

const useCurrentOrder = (orders, orderId) => {
  return useMemo(() => {
    if (!orderId) {
      return undefined;
    }

    return orders.find((order) => order.id === orderId);
  }, [orders, orderId]);
};

const Page = () => {
  const rootRef = useRef(null);
  const ordersSearch = useOrdersSearch();
  const ordersStore = useOrdersStore(ordersSearch.state);
  const dialog = useDialog();
  const currentOrder = useCurrentOrder(ordersStore.orders, dialog.data);

  usePageView();

  const handleOrderOpen = useCallback((orderId) => {
    // Close drawer if is the same order

    if (dialog.open && dialog.data === orderId) {
      dialog.handleClose();
      return;
    }

    dialog.handleOpen(orderId);
  }, [dialog]);

  return (
    <>
      <Seo title="Dashboard: Order List" />
      <Divider />
      <Box
        component="main"
        ref={rootRef}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box
          ref={rootRef}
          sx={{
            bottom: 0,
            display: 'flex',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0
          }}
        >
          <OrderListContainer open={dialog.open}>
            <Box sx={{ p: 3 }}>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={4}
              >
                <div>
                  <Typography variant="h4">
                    Orders
                  </Typography>
                </div>
                <div>
                  <Button
                    startIcon={(
                      <SvgIcon>
                        <PlusIcon />
                      </SvgIcon>
                    )}
                    variant="contained"
                  >
                    Add
                  </Button>
                </div>
              </Stack>
            </Box>
            <Divider />
            <OrderListSearch
              onFiltersChange={ordersSearch.handleFiltersChange}
              onSortChange={ordersSearch.handleSortChange}
              sortBy={ordersSearch.state.sortBy}
              sortDir={ordersSearch.state.sortDir}
            />
            <Divider />
            <OrderListTable
              count={ordersStore.ordersCount}
              items={ordersStore.orders}
              onPageChange={ordersSearch.handlePageChange}
              onRowsPerPageChange={ordersSearch.handleRowsPerPageChange}
              onSelect={handleOrderOpen}
              page={ordersSearch.state.page}
              rowsPerPage={ordersSearch.state.rowsPerPage}
            />
          </OrderListContainer>
          <OrderDrawer
            container={rootRef.current}
            onClose={dialog.handleClose}
            open={dialog.open}
            order={currentOrder}
          />
        </Box>
      </Box>
    </>
  );
};

export default Page;
