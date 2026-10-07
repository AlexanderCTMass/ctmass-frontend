import PropTypes from 'prop-types';
import { format, formatDistanceToNowStrict } from 'date-fns';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  ListItemButton,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Fragment } from 'react';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import { getInitials } from 'src/utils/get-initials';
import { toMillis } from 'src/api/customers';
import PersonIcon from '@mui/icons-material/Person';
import EngineeringIcon from '@mui/icons-material/Engineering';

export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const ROLE_LABELS = {
  CUSTOMER: 'Customer',
  WORKER: 'Service provider',
  PARTNER: 'Partner'
};

const getRegistration = (customer) => {
  const millis = toMillis(customer.registrationAt) || toMillis(customer.createdAt);
  if (!millis) return null;
  const date = new Date(millis);
  return {
    date: format(date, 'MMM d, yyyy'),
    relative: formatDistanceToNowStrict(date, { addSuffix: true })
  };
};

const getLocation = (customer) => {
  const parts = [customer.city, customer.state].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return customer.address?.location?.place_name || '';
};

const testerRowSx = (theme) => ({
  backgroundColor: alpha(theme.palette.success.main, 0.08),
  boxShadow: `inset 4px 0 0 ${theme.palette.success.main}`
});

const RoleIcon = ({ role }) => {
  if (role === 'WORKER') return <EngineeringIcon color="primary" fontSize="small" />;
  return <PersonIcon color="info" fontSize="small" />;
};

const TesterChip = () => (
  <Chip
    color="success"
    label="Tester"
    size="small"
    sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
  />
);

const MobileList = ({ items, onItemOpen }) => (
  <Box>
    {items.map((customer, index) => {
      const registration = getRegistration(customer);
      const location = getLocation(customer);

      return (
        <Fragment key={customer.id}>
          {index > 0 && <Divider />}
          <ListItemButton
            component={RouterLink}
            href={paths.dashboard.customers.details.replace(':customerId', customer.id)}
            onClick={onItemOpen}
            sx={(theme) => ({
              alignItems: 'flex-start',
              gap: 1.5,
              px: 2,
              py: 1.5,
              ...(customer.isTester ? testerRowSx(theme) : {})
            })}
          >
            <Avatar
              src={customer.avatar}
              sx={{ height: 44, width: 44, mt: 0.25 }}
            >
              {getInitials(customer.name)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                sx={{ minWidth: 0 }}
              >
                <Typography
                  noWrap
                  variant="subtitle2"
                  sx={{ minWidth: 0 }}
                >
                  {customer.name || '—'}
                </Typography>
                {customer.isTester && <TesterChip />}
              </Stack>
              <Typography
                color="text.secondary"
                noWrap
                variant="body2"
              >
                {customer.email}
              </Typography>
              <Stack
                alignItems="center"
                direction="row"
                flexWrap="wrap"
                columnGap={1}
                sx={{ mt: 0.5 }}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={0.5}
                >
                  <RoleIcon role={customer.role} />
                  <Typography
                    color="text.secondary"
                    variant="caption"
                  >
                    {ROLE_LABELS[customer.role] || customer.role}
                  </Typography>
                </Stack>
                {registration && (
                  <Typography
                    color="text.secondary"
                    variant="caption"
                  >
                    · Joined {registration.date} ({registration.relative})
                  </Typography>
                )}
              </Stack>
              {location && (
                <Typography
                  color="text.secondary"
                  noWrap
                  variant="caption"
                  component="div"
                >
                  {location}
                </Typography>
              )}
            </Box>
            <SvgIcon
              color="action"
              fontSize="small"
              sx={{ alignSelf: 'center' }}
            >
              <ArrowRightIcon />
            </SvgIcon>
          </ListItemButton>
        </Fragment>
      );
    })}
  </Box>
);

const DesktopTable = ({ items, onItemOpen }) => (
  <Scrollbar>
    <Table sx={{ minWidth: 900 }}>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            Role
          </TableCell>
          <TableCell>
            Name
          </TableCell>
          <TableCell>
            Registered
          </TableCell>
          <TableCell>
            Location
          </TableCell>
          <TableCell>
            Phone
          </TableCell>
          <TableCell align="right">
            Actions
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((customer) => {
          const registration = getRegistration(customer);
          const replaceWithId = (path) => path.replace(':customerId', customer.id);

          return (
            <TableRow
              hover
              key={customer.id}
              sx={customer.isTester ? testerRowSx : undefined}
            >
              <TableCell padding="checkbox">
                <Tooltip title={ROLE_LABELS[customer.role] || customer.role || ''}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <RoleIcon role={customer.role} />
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <Avatar
                    src={customer.avatar}
                    sx={{
                      height: 42,
                      width: 42
                    }}
                  >
                    {getInitials(customer.name)}
                  </Avatar>
                  <div>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <Link
                        color="inherit"
                        component={RouterLink}
                        href={replaceWithId(paths.dashboard.customers.details)}
                        onClick={onItemOpen}
                        variant="subtitle2"
                      >
                        {customer.name}
                      </Link>
                      {customer.isTester && <TesterChip />}
                    </Stack>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {customer.email}
                    </Typography>
                  </div>
                </Stack>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {registration ? (
                  <>
                    <Typography variant="body2">
                      {registration.date}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                    >
                      {registration.relative}
                    </Typography>
                  </>
                ) : '—'}
              </TableCell>
              <TableCell>
                {getLocation(customer) || '—'}
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">
                  {customer.phone || '—'}
                </Typography>
              </TableCell>
              <TableCell
                align="right"
                sx={{ whiteSpace: 'nowrap' }}
              >
                <IconButton
                  component={RouterLink}
                  href={replaceWithId(paths.dashboard.customers.edit)}
                  onClick={onItemOpen}
                >
                  <SvgIcon>
                    <Edit02Icon />
                  </SvgIcon>
                </IconButton>
                <IconButton
                  component={RouterLink}
                  href={replaceWithId(paths.dashboard.customers.details)}
                  onClick={onItemOpen}
                >
                  <SvgIcon>
                    <ArrowRightIcon />
                  </SvgIcon>
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </Scrollbar>
);

export const CustomerListTable = (props) => {
  const {
    count = 0,
    items = [],
    loaded = true,
    onItemOpen,
    onPageChange = () => { },
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0
  } = props;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Box sx={{ position: 'relative' }}>
      <Divider />
      {!loaded && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {loaded && items.length === 0 && (
        <Typography
          align="center"
          color="text.secondary"
          sx={{ py: 6 }}
          variant="body2"
        >
          No users found
        </Typography>
      )}
      {loaded && items.length > 0 && (isMobile
        ? <MobileList items={items} onItemOpen={onItemOpen} />
        : <DesktopTable items={items} onItemOpen={onItemOpen} />)}
      <TablePagination
        component="div"
        count={count}
        labelRowsPerPage={isMobile ? 'Rows' : 'Rows per page:'}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        sx={{
          '& .MuiTablePagination-toolbar': { px: { xs: 1, sm: 2 } },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: { xs: 12, sm: 14 } }
        }}
      />
    </Box>
  );
};

CustomerListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  loaded: PropTypes.bool,
  onItemOpen: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number
};
