import { Box } from '@mui/material';
import {styled} from "@mui/material/styles";
import { Logo } from './logo';

const BouncingElement = styled(Box)`
    height: 60px;
    width: 60px;    
    color: white;
    justify-content: center;
    align-items: center;
    display: 'flex';
    border-radius: 50%;
    font-size: 18px;
    animation: bounce 1s infinite;

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-20px);
        }
    }
`;

export const SplashScreen = () => (
  <Box
    sx={{
      alignItems: 'center',
      backgroundColor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      justifyContent: 'center',
      left: 0,
      p: 3,
      position: 'fixed',
      top: 0,
      width: '100vw',
      zIndex: 1400
    }}
  >
    <BouncingElement    >
      <Logo />
    </BouncingElement>
  </Box>
);
