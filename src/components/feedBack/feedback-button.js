import PropTypes from 'prop-types';
import Settings03Icon from '@untitled-ui/icons-react/build/esm/Settings03';
import { Box, ButtonBase, SvgIcon, Tooltip } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import {RouterLink} from "src/components/router-link";
import {paths} from 'src/paths';
export const FeedbackButton = (props) => (
  <Tooltip title="Feedback">
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: '50%',
        bottom: 0,
        boxShadow: 16,
        margin: (theme) => theme.spacing(4),
        position: 'fixed',
        left: 0,
        zIndex: (theme) => theme.zIndex.speedDial
      }}
      {...props}>
      <ButtonBase
        sx={{
          backgroundColor: 'primary.main',
          borderRadius: '50%',
          color: 'primary.contrastText',
          p: '10px'
        }}
        component={RouterLink}
        href={paths.contact}
      >
        <SvgIcon>
          <FeedbackIcon />
        </SvgIcon>
      </ButtonBase>
    </Box>
  </Tooltip>
);

FeedbackButton.propTypes = {
  onClick: PropTypes.func
};
