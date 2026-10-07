import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import { Avatar, Button, Chip, Stack, SvgIcon, Typography } from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { getInitials } from 'src/utils/get-initials';
import { toMillis } from 'src/api/customers';

const ROLE_LABELS = {
    CUSTOMER: 'Customer',
    WORKER: 'Service provider',
    PARTNER: 'Partner'
};

export const CustomerPageHeader = ({ customer, backHref, backLabel, action }) => {
    const registeredMillis = toMillis(customer.registrationAt) || toMillis(customer.createdAt);

    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(customer.id);
            toast.success('User ID copied');
        } catch (e) {
            toast.error('Failed to copy');
        }
    };

    return (
        <Stack spacing={{ xs: 2, md: 3 }}>
            <div>
                <Button
                    color="inherit"
                    component={RouterLink}
                    href={backHref}
                    size="large"
                    startIcon={(
                        <SvgIcon>
                            <ArrowLeftIcon />
                        </SvgIcon>
                    )}
                    sx={{ ml: -1.5 }}
                >
                    {backLabel}
                </Button>
            </div>
            <Stack
                alignItems={{ xs: 'stretch', md: 'flex-start' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={2}
            >
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                    sx={{ minWidth: 0 }}
                >
                    <Avatar
                        src={customer.avatar}
                        sx={{
                            height: { xs: 56, md: 64 },
                            width: { xs: 56, md: 64 },
                            flexShrink: 0
                        }}
                    >
                        {getInitials(customer.name)}
                    </Avatar>
                    <Stack
                        spacing={0.75}
                        sx={{ minWidth: 0 }}
                    >
                        <Typography
                            variant="h4"
                            sx={{ fontSize: { xs: 22, md: 32 }, wordBreak: 'break-word' }}
                        >
                            {customer.name}
                        </Typography>
                        <Stack
                            direction="row"
                            flexWrap="wrap"
                            gap={1}
                        >
                            {customer.role && (
                                <Chip
                                    label={ROLE_LABELS[customer.role] || customer.role}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                            {customer.isTester && (
                                <Chip
                                    color="success"
                                    label="Tester"
                                    size="small"
                                />
                            )}
                        </Stack>
                        {registeredMillis > 0 && (
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                Registered {format(new Date(registeredMillis), 'MMM d, yyyy, HH:mm')}
                            </Typography>
                        )}
                        <Chip
                            clickable
                            label={`ID: ${customer.id}`}
                            onClick={handleCopyId}
                            size="small"
                            sx={{
                                alignSelf: 'flex-start',
                                maxWidth: '100%',
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }
                            }}
                        />
                    </Stack>
                </Stack>
                {action && (
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                    >
                        {action}
                    </Stack>
                )}
            </Stack>
        </Stack>
    );
};

CustomerPageHeader.propTypes = {
    action: PropTypes.node,
    backHref: PropTypes.string.isRequired,
    backLabel: PropTypes.string.isRequired,
    customer: PropTypes.object.isRequired
};
