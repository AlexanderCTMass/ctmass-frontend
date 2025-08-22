import {
    Box,
    Stack,
    Typography,
    Button,
} from '@mui/material';
import { roles } from 'src/roles';
import { paths } from 'src/paths';
import { SpecialistMicroPreview } from 'src/sections/components/specialist/specialist-micro-preview';
import { CategoryBadge } from './CategoryBadge';
import { CardShell } from './CardShell';

export const PersonCard = ({ person, badgeType, onRemove }) => {
    const subtitle =
        person.role === roles.WORKER
            ? (person.specialties?.map(s => s?.label).filter(Boolean).join(', ') || 'Contractor')
            : 'Homeowner';

    return (
        <CardShell>
            <SpecialistMicroPreview
                specialist={person}
                to={person.role === roles.WORKER
                    ? paths.specialist.publicPage?.replace(':profileId', person.id) || `/specialist/${person.id}`
                    : `/specialist/${person.id}`}
            />
            <Stack sx={{ ml: 1, flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" className="truncate">
                    {person.businessName || person.name || person.email}
                </Typography>
                <Typography variant="caption" color="text.secondary" className="truncate">
                    {subtitle}
                </Typography>
            </Stack>

            {onRemove && (
                <Button
                    size="small"
                    color="error"
                    variant="text"
                    onClick={() => onRemove(person.id)}
                    sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
                >
                    Remove
                </Button>
            )}
        </CardShell>
    );
};