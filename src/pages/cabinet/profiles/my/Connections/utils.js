import HandshakeIcon from '@mui/icons-material/Handshake';
import PlaceIcon from '@mui/icons-material/Place';
import RecommendIcon from '@mui/icons-material/Recommend';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const CATEGORY_META = {
    trustedColleagues: {
        title: 'Trusted Colleagues',
        description: 'Contractors you recommend to others',
        color: 'success',
        icon: <RecommendIcon fontSize="small" />
    },
    localPros: {
        title: 'Local Pros',
        description: 'Fellow builders and tradespeople nearby',
        color: 'info',
        icon: <PlaceIcon fontSize="small" />
    },
    pastClients: {
        title: 'Past Clients',
        description: "Homeowners you've completed work for",
        color: 'warning',
        icon: <HandshakeIcon fontSize="small" />
    },
    interestedHomeowners: {
        title: 'Interested Homeowners',
        description: 'Potential clients checking your profile',
        color: 'secondary',
        icon: <VisibilityIcon fontSize="small" />
    }
};
