import PropTypes from 'prop-types';
import Settings03Icon from '@untitled-ui/icons-react/build/esm/Settings03';
import {Box, ButtonBase, SvgIcon, Tooltip} from '@mui/material';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import {RouterLink} from "src/components/router-link";
import {paths} from 'src/paths';

export const DonateButton = (props) => (
    <Tooltip title="Donation to CTMASS.com will be appreciate!">
        <Box
            sx={{
                backgroundColor: 'background.paper',
                borderRadius: '50%',
                bottom: 0,
                boxShadow: 16,
                marginBottom: (theme) => theme.spacing(11),
                marginLeft: (theme) => theme.spacing(4),
                position: 'fixed',
                left: 0,
                zIndex: (theme) => theme.zIndex.speedDial,

            }}
            animation = {'pulse'}
            {...props}>
            <ButtonBase
                sx={{
                    backgroundColor: '#F79009',
                    borderRadius: '50%',
                    color: 'primary.contrastText',
                    p: '10px'
                }}
                component={RouterLink}
                href={paths.donationGofund}
            >
                <SvgIcon>
                    <VolunteerActivismIcon/>
                </SvgIcon>
            </ButtonBase>
        </Box>
    </Tooltip>
);

DonateButton.propTypes = {
    onClick: PropTypes.func
};
