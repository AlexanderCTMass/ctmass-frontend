import PropTypes from 'prop-types';
import User01Icon from '@untitled-ui/icons-react/build/esm/User01';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    SvgIcon,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {useCallback, useRef} from "react";
import {BasicEditForm} from "./general/basic-edit-form";
import {BasicCustomerEditForm} from "./general/basic-customer-edit-form";

export const AccountCustomerSettings = (props) => {
    const {
        user,
        handleProfileChange,
        handleAvatarChange
    } = props;

    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);


    return (
        <Stack
            spacing={4}
            sx={{mb:4}}
            {...props}>
            <Card>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        <Grid
                            xs={12}
                            md={4}
                        >
                            <Typography variant="h6">
                                Basic details
                            </Typography>
                        </Grid>
                        <Grid
                            xs={12}
                            md={8}
                        >
                            <Stack spacing={3}>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={2}
                                >
                                    <Box
                                        sx={{
                                            borderColor: 'neutral.300',
                                            borderRadius: '50%',
                                            borderStyle: 'dashed',
                                            borderWidth: 1,
                                            p: '4px'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                borderRadius: '50%',
                                                height: '100%',
                                                width: '100%',
                                                position: 'relative'
                                            }}
                                        >
                                            <Avatar
                                                src={user.avatar}
                                                sx={{
                                                    height: 100,
                                                    width: 100
                                                }}
                                            >
                                                <SvgIcon>
                                                    <User01Icon/>
                                                </SvgIcon>
                                            </Avatar>
                                        </Box>
                                    </Box>
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={handleAttach}
                                    >
                                        Change
                                    </Button>
                                    <input
                                        hidden
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleAvatarChange}
                                    />
                                </Stack>
                                <BasicCustomerEditForm customer={user} onSubmit={handleProfileChange}/>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Stack>
    )        ;
};

AccountCustomerSettings.propTypes = {
    avatar: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
};
