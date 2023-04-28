import { useCallback, useEffect, useState } from 'react';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Link,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { customersApi } from 'src/api/customers';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { CustomerBasicDetails } from 'src/sections/dashboard/customer/customer-basic-details';
import { CustomerDataManagement } from 'src/sections/dashboard/customer/customer-data-management';
import { CustomerEmailsSummary } from 'src/sections/dashboard/customer/customer-emails-summary';
import { CustomerInvoices } from 'src/sections/dashboard/customer/customer-invoices';
import { CustomerPayment } from 'src/sections/dashboard/customer/customer-payment';
import { CustomerLogs } from 'src/sections/dashboard/customer/customer-logs';
import { getInitials } from 'src/utils/get-initials';

const tabs = [
  { label: 'Details', value: 'details' },
  { label: 'Invoices', value: 'invoices' },
  { label: 'Logs', value: 'logs' }
];

const useCustomer = () => {
  const isMounted = useMounted();
  const [customer, setCustomer] = useState(null);

  const handleCustomerGet = useCallback(async () => {
    try {
      const response = await customersApi.getCustomer();

      if (isMounted()) {
        setCustomer(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
      handleCustomerGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return customer;
};

const useInvoices = () => {
  const isMounted = useMounted();
  const [invoices, setInvoices] = useState([]);

  const handleInvoicesGet = useCallback(async () => {
    try {
      const response = await customersApi.getInvoices();

      if (isMounted()) {
        setInvoices(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
      handleInvoicesGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return invoices;
};

const useLogs = () => {
  const isMounted = useMounted();
  const [logs, setLogs] = useState([]);

  const handleLogsGet = useCallback(async () => {
    try {
      const response = await customersApi.getLogs();

      if (isMounted()) {
        setLogs(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
      handleLogsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return logs;
};

const Page = () => {
  const [currentTab, setCurrentTab] = useState('details');
  const customer = useCustomer();
  const invoices = useInvoices();
  const logs = useLogs();

  usePageView();

  const handleTabsChange = useCallback((event, value) => {
    setCurrentTab(value);
  }, []);

  if (!customer) {
    return null;
  }

  return (
    <>
      <Seo title="Dashboard: Customer Details" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Stack spacing={4}>
              <div>
                <Link
                  color="text.primary"
                  component={RouterLink}
                  href={paths.dashboard.customers.index}
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
                    Customers
                  </Typography>
                </Link>
              </div>
              <Stack
                alignItems="flex-start"
                direction={{
                  xs: 'column',
                  md: 'row'
                }}
                justifyContent="space-between"
                spacing={4}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <Avatar
                    src={customer.avatar}
                    sx={{
                      height: 64,
                      width: 64
                    }}
                  >
                    {getInitials(customer.name)}
                  </Avatar>
                  <Stack spacing={1}>
                    <Typography variant="h4">
                      {customer.email}
                    </Typography>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <Typography variant="subtitle2">
                        user_id:
                      </Typography>
                      <Chip
                        label={customer.id}
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </Stack>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <Button
                    color="inherit"
                    component={RouterLink}
                    endIcon={(
                      <SvgIcon>
                        <Edit02Icon />
                      </SvgIcon>
                    )}
                    href={paths.dashboard.customers.edit}
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
                    Actions
                  </Button>
                </Stack>
              </Stack>
              <div>
                <Tabs
                  indicatorColor="primary"
                  onChange={handleTabsChange}
                  scrollButtons="auto"
                  sx={{ mt: 3 }}
                  textColor="primary"
                  value={currentTab}
                  variant="scrollable"
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.value}
                      label={tab.label}
                      value={tab.value}
                    />
                  ))}
                </Tabs>
                <Divider />
              </div>
            </Stack>
            {currentTab === 'details' && (
              <div>
                <Grid
                  container
                  spacing={4}
                >
                  <Grid
                    xs={12}
                    lg={4}
                  >
                    <CustomerBasicDetails
                      address1={customer.address1}
                      address2={customer.address2}
                      country={customer.country}
                      email={customer.email}
                      isVerified={!!customer.isVerified}
                      phone={customer.phone}
                      state={customer.state}
                    />
                  </Grid>
                  <Grid
                    xs={12}
                    lg={8}
                  >
                    <Stack spacing={4}>
                      <CustomerPayment />
                      <CustomerEmailsSummary />
                      <CustomerDataManagement />
                    </Stack>
                  </Grid>
                </Grid>
              </div>
            )}
            {currentTab === 'invoices' && <CustomerInvoices invoices={invoices} />}
            {currentTab === 'logs' && <CustomerLogs logs={logs} />}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;

