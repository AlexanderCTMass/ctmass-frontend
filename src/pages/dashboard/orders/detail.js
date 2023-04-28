import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import CalendarIcon from '@untitled-ui/icons-react/build/esm/Calendar';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import { Box, Button, Container, Link, Stack, SvgIcon, Typography } from '@mui/material';
import { ordersApi } from 'src/api/orders';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { OrderItems } from 'src/sections/dashboard/order/order-items';
import { OrderLogs } from 'src/sections/dashboard/order/order-logs';
import { OrderSummary } from 'src/sections/dashboard/order/order-summary';

const useOrder = () => {
  const isMounted = useMounted();
  const [order, setOrder] = useState(null);

  const handleOrderGet = useCallback(async () => {
    try {
      const response = await ordersApi.getOrder();

      if (isMounted()) {
        setOrder(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
      handleOrderGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return order;
};

const Page = () => {
  const order = useOrder();

  usePageView();

  if (!order) {
    return null;
  }

  const createdAt = format(order.createdAt, 'dd/MM/yyyy HH:mm');

  return (
    <>
      <Seo title="Dashboard: Order Details" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4}>
            <div>
              <Link
                color="text.primary"
                component={RouterLink}
                href={paths.dashboard.orders.index}
                sx={{
                  alignItems: 'center',
                  display: 'inline-flex'
                }}
                underline="hover"
              >
                <SvgIcon sx={{ mr: 1 }}>
                  <ArrowLeftIcon />
                </SvgIcon>
                <Typography variant="subtitle2">
                  Orders
                </Typography>
              </Link>
            </div>
            <div>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={3}
              >
                <Stack spacing={1}>
                  <Typography variant="h4">
                    {order.number}
                  </Typography>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Placed on
                    </Typography>
                    <SvgIcon color="action">
                      <CalendarIcon />
                    </SvgIcon>
                    <Typography variant="body2">
                      {createdAt}
                    </Typography>
                  </Stack>
                </Stack>
                <div>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                  >
                    <Button
                      color="inherit"
                      endIcon={(
                        <SvgIcon>
                          <Edit02Icon />
                        </SvgIcon>
                      )}
                    >
                      Edit
                    </Button>
                    <Button
                      endIcon={(
                        <SvgIcon>
                          <ChevronDownIcon />
                        </SvgIcon>
                      )}
                      variant="contained"
                    >
                      Action
                    </Button>
                  </Stack>
                </div>
              </Stack>
            </div>
            <OrderSummary order={order} />
            <OrderItems items={order.items || []} />
            <OrderLogs logs={order.logs || []} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;

