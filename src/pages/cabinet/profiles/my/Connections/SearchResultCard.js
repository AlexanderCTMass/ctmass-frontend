import {
    Stack,
    Typography,
    IconButton,
    Tooltip,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import RecommendIcon from '@mui/icons-material/Recommend';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CardShell } from './CardShell';
import { SpecialistMicroPreview } from 'src/sections/components/specialist/specialist-micro-preview';

export const SearchResultCard = ({ specialist, onAdd }) => {
    return (
        <CardShell>
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
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 'auto' }}>
                <Tooltip title="Add to Trusted Colleagues">
                    <IconButton size="small" color="success" onClick={() => onAdd('trustedColleagues', specialist)}>
                        <RecommendIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Add to Local Pros">
                    <IconButton size="small" color="info" onClick={() => onAdd('localPros', specialist)}>
                        <PlaceIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Add to Interested Homeowners">
                    <IconButton size="small" color="secondary" onClick={() => onAdd('interestedHomeowners', specialist)}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </CardShell>
    );
};