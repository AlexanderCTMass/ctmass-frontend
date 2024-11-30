import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import {Avatar, Button, Card, CardHeader, Link, Stack, SvgIcon, Typography} from '@mui/material';
import ClockIcon from "@untitled-ui/icons-react/build/esm/Clock";
import {formatDistanceToNowStrict} from "date-fns";
import * as React from "react";

export const ProjectPreview = (props) => {
    const {onBack, onNext, project, ...other} = props;
    return (
        <Stack spacing={2}>
            <Stack direction="row">
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                >
                    <Avatar
                        sx={{
                            backgroundColor: 'success.main',
                            color: 'success.contrastText',
                            height: 40,
                            width: 40
                        }}
                    >
                        <SvgIcon>
                            <CheckIcon/>
                        </SvgIcon>
                    </Avatar>
                    <div>
                        <Typography
                            color="text.secondary"
                            variant="overline"
                        >
                            All done!
                        </Typography>
                    </div>
                </Stack>
            </Stack>
            <Typography
                color="text.secondary"
                variant="body2"
            >
                Here’s a preview of your newly created project
            </Typography>
            <Card variant="outlined">
                <CardHeader
                    avatar={(
                        <Avatar
                            component="a"
                            href="#"
                            src={"post.authorAvatar"}
                        />
                    )}
                    disableTypography
                    subheader={(
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={1}
                        >
                            <SvgIcon color="action">
                                <ClockIcon/>
                            </SvgIcon>

                        </Stack>
                    )}
                    title={(
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={0.5}
                            sx={{mb: 1}}
                        >
                            <Link
                                color="text.primary"
                                href="#"
                                variant="subtitle2"
                            >
                                {"post.authorName"}
                            </Link>
                            <Typography variant="body2">
                                added a review
                            </Typography>
                        </Stack>
                    )}
                />
                <Stack
                    alignItems="center"
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    sx={{
                        px: 2,
                        py: 1.5
                    }}
                >
                    <div>
                        <Typography variant="subtitle1">
                            {project.title}
                        </Typography>
                        <div dangerouslySetInnerHTML={{__html: project.description}}/>
                    </div>
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                    >
                        {/* <Typography
                        color="text.secondary"
                        variant="caption"
                    >
                        {dictionaryApi.getSpecialityById(project.category).label}
                    </Typography>*/}
                        <Typography
                            color="text.secondary"
                            variant="caption"
                        >
                            {formatDistanceToNowStrict(new Date())}
                            {' '}
                            ago
                        </Typography>
                        <Button size="small">
                            Apply
                        </Button>
                    </Stack>
                </Stack>
            </Card>
        </Stack>
    );
}