import PropTypes from 'prop-types';
import {Avatar, Card, CardContent, Divider, Stack, Typography} from '@mui/material';
import {PropertyList} from 'src/components/property-list';
import {PropertyListItem} from 'src/components/property-list-item';
import {getInitials} from 'src/utils/get-initials';
import {formatDateRange} from "src/utils/date-locale";

export const ProjectSummary = (props) => {
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
                    Details
                </Typography>
                <PropertyList>
                    <PropertyListItem
                        align="vertical"
                        label="Id"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={"#" + project.project.id}
                    />
                    <PropertyListItem
                        align="vertical"
                        label="Dates"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={project.project.projectStartType === "period" ? formatDateRange(project.project.start?.toDate(), project.project.end?.toDate()) : project.project.projectStartType}
                    />
                    <PropertyListItem
                        align="vertical"
                        label="Location"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={project.project.location?.place_name}
                    />
                    <PropertyListItem
                        align="vertical"
                        label="Maximum budget"
                        sx={{
                            px: 0,
                            py: 1
                        }}
                        value={"$" + project.project.projectMaximumBudget}
                    />
                </PropertyList>
                <Divider sx={{my: 2}}/>
                <Typography
                    color="text.secondary"
                    component="p"
                    sx={{mb: 2}}
                    variant="overline"
                >
                    Customer
                </Typography>
                <Stack spacing={2}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                    >
                        <Avatar src={project.project.customerAvatar}>
                            {getInitials(project.project.customerName)}
                        </Avatar>
                        <div>
                            <Typography variant="subtitle2">
                                {project.project.customerName}
                            </Typography>
                            {/*<Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {founder.role}
                                </Typography>*/}
                        </div>
                    </Stack>
                </Stack>
                <Divider sx={{my: 2}}/>
                <Typography
                    color="text.secondary"
                    component="p"
                    sx={{mb: 2}}
                    variant="overline"
                >
                    Contractor
                </Typography>
                <Stack spacing={2}>
                    {project.project.contractorId ?
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                        >
                            <Avatar src={project.project.customerAvatar}>
                                {getInitials(project.project.customerName)}
                            </Avatar>
                            <div>
                                <Typography variant="subtitle2">
                                    {project.project.customerName}
                                </Typography>
                                {/*<Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {founder.role}
                                </Typography>*/}
                            </div>
                        </Stack> :
                        <Typography variant="subtitle2">
                            Still in the search
                        </Typography>}
                </Stack>
            </CardContent>
        </Card>
    );
};

ProjectSummary.propTypes = {
    project: PropTypes.object.isRequired
};
