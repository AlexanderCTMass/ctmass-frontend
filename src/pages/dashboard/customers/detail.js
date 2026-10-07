import { useCallback, useEffect, useState } from 'react';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import {
    Box,
    Button,
    Container,
    Divider,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
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
import { CustomerTesterToggle } from 'src/sections/dashboard/customer/customer-tester-toggle';
import { CustomerPageHeader } from 'src/sections/dashboard/customer/customer-page-header';
import { isAdminUser } from 'src/guards/admin-guard';
import { useAuth } from 'src/hooks/use-auth';
import { useParams } from "react-router";

const tabs = [
    { label: 'Details', value: 'details' },
    { label: 'Invoices', value: 'invoices' },
    // {label: 'Logs', value: 'logs'}
];

const useCustomer = () => {
    const isMounted = useMounted();
    const { customerId } = useParams();
    const [customer, setCustomer] = useState(null);

    const handleCustomerGet = useCallback(async () => {
        try {
            const response = await customersApi.getCustomer(customerId);

            if (isMounted()) {
                setCustomer(response);
            }
        } catch (err) {
            console.error(err);
        }
    }, [customerId, isMounted]);

    useEffect(() => {
        handleCustomerGet();
    }, [handleCustomerGet]);

    return [customer, setCustomer];
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
    const [customer, setCustomer] = useCustomer();
    const invoices = useInvoices();
    const logs = useLogs();
    const { user } = useAuth();
    const isAdmin = isAdminUser(user);

    usePageView();

    const { customerId } = useParams();

    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    const handleTesterChange = useCallback((isTester) => {
        setCustomer((prev) => (prev ? { ...prev, isTester: isTester || undefined } : prev));
    }, [setCustomer]);

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
                    py: { xs: 3, md: 8 }
                }}
            >
                <Container
                    maxWidth="xl"
                    sx={{ px: { xs: 2, sm: 3 } }}
                >
                    <Stack spacing={4}>
                        <Stack spacing={{ xs: 2, md: 4 }}>
                            <CustomerPageHeader
                                backHref={paths.dashboard.customers.index}
                                backLabel="Customers"
                                customer={customer}
                                action={(
                                    <Button
                                        color="inherit"
                                        component={RouterLink}
                                        endIcon={(
                                            <SvgIcon>
                                                <Edit02Icon />
                                            </SvgIcon>
                                        )}
                                        href={paths.dashboard.customers.edit.replace(":customerId", customerId)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            />
                            <div>
                                <Tabs
                                    indicatorColor="primary"
                                    onChange={handleTabsChange}
                                    scrollButtons="auto"
                                    sx={{ mt: { xs: 0, md: 3 } }}
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
                                    spacing={{ xs: 2, md: 4 }}
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
                                        <Stack spacing={{ xs: 2, md: 4 }}>
                                            {/*<CustomerPayment/>*/}
                                            <CustomerEmailsSummary customer={customer} />
                                            <CustomerTesterToggle
                                                customer={customer}
                                                onChange={handleTesterChange}
                                            />
                                            <CustomerDataManagement customer={customer} isAdmin={isAdmin} />
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

