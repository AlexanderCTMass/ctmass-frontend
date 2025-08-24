import {
    Button,
} from '@mui/material';
import { roles } from 'src/roles';
import { paths } from 'src/paths';
import { SpecialistMicroPreview } from 'src/sections/components/specialist/specialist-micro-preview';
import { CardShell } from './CardShell';

export const PersonCard = ({ person, badgeType, onRemove }) => {
    return (
        <CardShell>
            <SpecialistMicroPreview
                specialist={person}
                to={person.role === roles.WORKER
                    ? paths.specialist.publicPage?.replace(':profileId', person.id) || `/specialist/${person.id}`
                    : `/specialist/${person.id}`}
            />

            {onRemove && (
                <Button
                    size="small"
                    color="error"
                    variant="text"
                    onClick={() => onRemove(person.id)}
                    sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
                    style={{ height: 45 }}
                >
                    Remove
                </Button>
            )}
        </CardShell>
    );
};