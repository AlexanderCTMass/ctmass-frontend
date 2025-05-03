import PropTypes from 'prop-types';
import {Box, Button, ButtonBase, Drawer, Stack, SvgIcon} from '@mui/material';
import {Logo} from 'src/components/logo';
import {RouterLink} from 'src/components/router-link';
import {usePathname} from 'src/hooks/use-pathname';
import {paths} from 'src/paths';
import {SideNavItem} from './side-nav-item';
import Menu01Icon from "@untitled-ui/icons-react/build/esm/Menu01";

const items = [
    {
        title: 'Home',
        path: paths.index
    },
    {
        title: 'Our mission',
        path: paths.ourMission
    },
    {
        title: 'Support & Feedback',
        path: paths.contact
    },
    /* {
         title: 'Become a performer',
         path: paths.register.index,
         ml: 5,
         hideForAuth: true
     }*/
];

const renderItems = ({depth = 0, items, pathname}) => items.reduce((acc,
                                                                    item) => reduceChildRoutes({
    acc,
    depth,
    item,
    pathname
}), []);

const reduceChildRoutes = ({acc, depth, item, pathname}) => {
    const checkPath = !!(item.path && pathname);
    const partialMatch = checkPath ? pathname.includes(item.path) : false;
    const exactMatch = checkPath ? pathname === item.path : false;

    if (item.children) {
        acc.push(
            <SideNavItem
                active={partialMatch}
                depth={depth}
                disabled={item.disabled}
                key={item.title}
                open={partialMatch}
                title={item.title}
            >
                <Stack spacing={2}>
                    {item.children.map((child, index) => (
                        <Stack
                            component="ul"
                            key={index}
                            spacing={0.5}
                            sx={{
                                listStyle: 'none',
                                m: 0,
                                p: 0
                            }}
                        >
                            {child.subheader && (
                                <Box
                                    component="li"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        lineHeight: 1.66,
                                        mb: 1,
                                        pl: '24px',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {child.subheader}
                                </Box>
                            )}
                            {child.items.map((item) => {
                                const checkPath = !!(item.path && pathname);
                                const active = checkPath ? pathname === item.path : false;

                                const linkProps = item.path
                                    ? item.external
                                        ? {
                                            component: 'a',
                                            href: item.path,
                                            target: '_blank'
                                        }
                                        : {
                                            component: RouterLink,
                                            href: item.path
                                        }
                                    : {};

                                return (
                                    <li key={item.title}>
                                        <ButtonBase
                                            sx={{
                                                alignItems: 'center',
                                                borderRadius: 1,
                                                display: 'flex',
                                                justifyContent: 'flex-start',
                                                pl: '24px',
                                                pr: '16px',
                                                py: '8px',
                                                textAlign: 'left',
                                                '&:hover': {
                                                    backgroundColor: 'action.hover'
                                                },
                                                ...(active && {
                                                    color: 'primary.main'
                                                })
                                            }}
                                            {...linkProps}>
                                            <Box
                                                component="span"
                                                sx={{
                                                    height: 6,
                                                    mr: 2,
                                                    width: 6
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        backgroundColor: 'neutral.400',
                                                        borderRadius: '50%',
                                                        height: 4,
                                                        opacity: 0,
                                                        width: 4,
                                                        ...(active && {
                                                            backgroundColor: 'primary.main',
                                                            height: 6,
                                                            opacity: 1,
                                                            width: 6
                                                        })
                                                    }}
                                                />
                                            </Box>
                                            <Box
                                                component="span"
                                                sx={{
                                                    flexGrow: 1,
                                                    fontFamily: (theme) => theme.typography.fontFamily,
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    lineHeight: '24px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {item.title}
                                            </Box>
                                        </ButtonBase>
                                    </li>
                                );
                            })}
                        </Stack>
                    ))}
                </Stack>
            </SideNavItem>
        );
    } else {
        acc.push(
            <SideNavItem
                active={exactMatch}
                depth={depth}
                disabled={item.disabled}
                external={item.external}
                key={item.title}
                path={item.path}
                title={item.title}
            />
        );
    }

    return acc;
};

export const SideNav = (props) => {
    const {onClose, open = false} = props;
    const pathname = usePathname();

    return (
        <Drawer
            anchor="right"
            onClose={onClose}
            open={open}
            PaperProps={{
                sx: {
                    maxWidth: '100%',
                    width: 300
                }
            }}
            variant="temporary"
        >
            <Box
                sx={{
                    pt: 2,
                    px: 2
                }}
            >
                <Stack
                    alignItems="center"
                    component={RouterLink}
                    direction="row"
                    display="inline-flex"
                    href={paths.index}
                    spacing={1}
                    sx={{textDecoration: 'none'}}
                >
                    <div className="hamburger" onClick={onClose}>
                        <SvgIcon fontSize="small">
                            <Menu01Icon/>
                        </SvgIcon>
                    </div>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            height: 56,
                            width: 56
                        }}
                    >
                        <Logo/>
                    </Box>
                    <Box
                        sx={{
                            color: 'text.primary',
                            fontFamily: '\'Plus Jakarta Sans\', sans-serif',
                            fontSize: 14,
                            fontWeight: 800,
                            letterSpacing: '0.3px',
                            lineHeight: 2.5,
                            '& span': {
                                color: 'primary.main'
                            }
                        }}
                    >
                        CT<span>MASS</span>
                    </Box>
                </Stack>
            </Box>
            <Box
                component="nav"
                sx={{p: 2}}
            >
                <Stack spacing={2} sx={{mb: 2}}>
                    {/*<Button
                        component="a"
                        size={'small'}
                        href={paths.login.indexAndCreateProject}
                        variant="outlined"
                        fullWidth
                    >
                        Create Project Ad
                    </Button>*/}
                    <Button
                        component="a"
                        size={'small'}
                        href={paths.register.specialist}
                        variant="outlined"
                        fullWidth
                    >
                        Start providing services
                    </Button>
                </Stack>
                <Stack
                    component="ul"
                    spacing={1}
                    sx={{
                        listStyle: 'none',
                        m: 0,
                        p: 0
                    }}
                >
                    {renderItems({items, pathname})}
                </Stack>

            </Box>
        </Drawer>
    );
};

SideNav.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool
};
