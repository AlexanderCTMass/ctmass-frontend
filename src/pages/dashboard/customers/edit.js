import { useCallback, useEffect, useState } from 'react';
import { Box, Container, Stack } from '@mui/material';
import { customersApi } from 'src/api/customers';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { CustomerEditForm } from 'src/sections/dashboard/customer/customer-edit-form';
import { CustomerPageHeader } from 'src/sections/dashboard/customer/customer-page-header';
import { useParams } from "react-router";

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

    return customer;
};

const Page = () => {
    const customer = useCustomer();

    usePageView();

    if (!customer) {
        return null;
    }

    return (
        <>
            <Seo title="Dashboard: Customer Edit" />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: { xs: 3, md: 8 }
                }}
            >
                <Container
                    maxWidth="lg"
                    sx={{ px: { xs: 2, sm: 3 } }}
                >
                    <Stack spacing={{ xs: 2, md: 4 }}>
                        <CustomerPageHeader
                            backHref={paths.dashboard.customers.details.replace(':customerId', customer.id)}
                            backLabel="Back to profile"
                            customer={customer}
                        />
                        <CustomerEditForm customer={customer} />
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default Page;
