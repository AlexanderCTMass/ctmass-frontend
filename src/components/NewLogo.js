import { Box } from '@mui/material';
import PropTypes from 'prop-types';

export const NewLogo = ({ height = 56 }) => (
    <Box
        component="img"
        src='/assets/NewLogo.png'
        alt="CTMASS"
        sx={{ height, width: 'auto' }}
    />
);

NewLogo.propTypes = {
    height: PropTypes.number
};