import {
    Box,
    Stack,
    Typography,
    Divider,
    Button
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import RecommendIcon from '@mui/icons-material/Recommend';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { CardShell } from './CardShell';
import { SpecialistMicroPreview } from 'src/sections/components/specialist/specialist-micro-preview';

const chipSx = {
    textTransform: 'none',
    borderRadius: 999,
    px: 1.25,
    height: 28,
    m: 0.5,
    '& .MuiButton-startIcon': { m: 0, mr: 0.75 },
};

const activeVariant = {
    variant: 'contained'
};
const inactiveVariant = {
    variant: 'outlined'
};

export const SearchResultCard = ({ specialist, idsByCategory, onToggle }) => {
    const isActive = (key) => (idsByCategory?.[key] || []).includes(specialist.id);

    return (
        <CardShell>
            <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <SpecialistMicroPreview
                        specialist={specialist}
                        to={`/specialists/${specialist.id}`}
                    />
                    <Stack sx={{ ml: 1, flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" className="truncate">
                            {specialist.businessName || specialist.name || specialist.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" className="truncate">
                            {specialist.specialties?.map(s => s?.label).filter(Boolean).join(', ')}
                        </Typography>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ px: { xs: 0, sm: 0 } }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Add this friend to connection categories
                    </Typography>

                    <Stack
                        direction="row"
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="center"
                        justifyContent="flex-start"
                        sx={{ mt: 0.5 }}
                    >
                        <Button
                            size="small"
                            color="success"
                            startIcon={<RecommendIcon fontSize="small" />}
                            onClick={() => onToggle('trustedColleagues', specialist)}
                            {...(isActive('trustedColleagues') ? activeVariant : inactiveVariant)}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Trusted Colleagues</Typography>
                        </Button>

                        <Button
                            size="small"
                            color="info"
                            startIcon={<PlaceIcon fontSize="small" />}
                            onClick={() => onToggle('localPros', specialist)}
                            {...(isActive('localPros') ? activeVariant : inactiveVariant)}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Local Pros</Typography>
                        </Button>

                        <Button
                            size="small"
                            color="warning"
                            startIcon={<HandshakeIcon fontSize="small" />}
                            onClick={() => onToggle('pastClients', specialist)}
                            {...(isActive('pastClients') ? activeVariant : inactiveVariant)}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Past Clients</Typography>
                        </Button>

                        <Button
                            size="small"
                            color="secondary"
                            startIcon={<VisibilityIcon fontSize="small" />}
                            onClick={() => onToggle('interestedHomeowners', specialist)}
                            {...(isActive('interestedHomeowners') ? activeVariant : inactiveVariant)}
                            sx={chipSx}
                        >
                            <Typography variant="caption" color="inherit">Interested Homeowners</Typography>
                        </Button>
                    </Stack>
                </Box>
            </Stack>
        </CardShell>
    );
};