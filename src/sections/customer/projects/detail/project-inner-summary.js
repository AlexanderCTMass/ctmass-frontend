import PropTypes from 'prop-types';
import {Avatar, Card, CardContent, Divider, Stack, Typography} from '@mui/material';
import {PropertyList} from 'src/components/property-list';
import {PropertyListItem} from 'src/components/property-list-item';
import {getInitials} from 'src/utils/get-initials';
import {formatDateRange} from "src/utils/date-locale";
import {format} from "date-fns";

export const ProjectInnerSummary = (props) => {
    const {project, ...other} = props;

    return (
        <Card {...other}>
            <CardContent>
                <Typography
                    color="text.secondary"
                    component="p"
                    sx={{mb: 2}}
                    variant="overline"
                >
                    More Details
                </Typography>
                <PropertyList>
                    <PropertyListItem
                        align="vertical"
                        label="Id"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={"#" + project.id}
                    />
                    <PropertyListItem
                        align="vertical"
                        label="Created At"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={format(project.createdAt.toDate(), 'dd/MM/yyyy | HH:mm')}
                    />
                </PropertyList>
            </CardContent>
        </Card>
    );
};

ProjectInnerSummary.propTypes = {
    project: PropTypes.object.isRequired
};
