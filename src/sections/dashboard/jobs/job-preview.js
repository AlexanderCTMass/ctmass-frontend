import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import { Avatar, Button, Card, Stack, SvgIcon, Typography } from '@mui/material';
import { dictionaryApi } from "../../../pages/components/dictionary/dictionaryApi";

export const JobPreview = (props) => (
    <Stack spacing={2}>
        <div>
            <Avatar
                sx={{
                    backgroundColor: 'success.main',
                    color: 'success.contrastText',
                    height: 40,
                    width: 40
                }}
            >
                <SvgIcon>
                    <CheckIcon />
                </SvgIcon>
            </Avatar>
            <Typography
                variant="h6"
                sx={{ mt: 2 }}
            >
                All done!
            </Typography>
            <Typography
                color="text.secondary"
                variant="body2"
            >
                Here’s a preview of your newly created job
            </Typography>
        </div>
        <Card variant="outlined">
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
                        {props.addedWork.title}
                    </Typography>
                    <div dangerouslySetInnerHTML={{ __html: props.addedWork.description }} />
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
                        {dictionaryApi.getSpecialityById(props.addedWork.category).label}
                    </Typography>*/}
                    <Button size="small">
                        Apply
                    </Button>
                </Stack>
            </Stack>
        </Card>
    </Stack>
);
