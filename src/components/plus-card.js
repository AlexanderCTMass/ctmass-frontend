import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { Add } from "@mui/icons-material"

const PlusCard = ({ onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            width: '94.5%',
            height: 200,
            border: '2px dashed',
            borderColor: 'grey.400',
            borderRadius: 1,
            color: 'grey.400',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all .25s',
            '&:hover': {
                bgcolor: 'grey.100',
                borderColor: 'primary.main',
                color: 'primary.main',
                transform: 'scale(1.03)',
            },
        }}
    >
        <Add fontSize="large" />
    </Box>
);

PlusCard.propTypes = { onClick: PropTypes.func };

export default PlusCard