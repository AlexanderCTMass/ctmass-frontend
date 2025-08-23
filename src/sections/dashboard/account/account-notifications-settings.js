import {
  Card,
  CardContent,
  Divider,
  Stack,
  Switch,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { Notifications } from "src/enums/notifications";

export const AccountNotificationsSettings = (props) => {
  const {
    notifications,
    handleProfileChange
  } = props;

  const handleNotificationChange = (notification, state) => {
    if (state) {
      handleProfileChange({ notifications: arrayUnion(notification) })
    } else {
      handleProfileChange({ notifications: arrayRemove(notification) })
    }
  }

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid
            xs={12}
            md={4}
          >
            <Typography variant="h6">
              Email
            </Typography>
          </Grid>
          <Grid
            xs={12}
            sm={12}
            md={8}
          >
            {/*<Stack*/}
            {/*    divider={<Divider/>}*/}
            {/*    spacing={3}*/}
            {/*>*/}
            {/*    <Stack*/}
            {/*        alignItems="flex-start"*/}
            {/*        direction="row"*/}
            {/*        justifyContent="space-between"*/}
            {/*        spacing={3}*/}
            {/*    >*/}
            {/*        <Stack spacing={1}>*/}
            {/*            <Typography variant="subtitle1">*/}
            {/*                Post and comments updates*/}
            {/*            </Typography>*/}
            {/*            <Typography*/}
            {/*                color="text.secondary"*/}
            {/*                variant="body2"*/}
            {/*            >*/}
            {/*                Posts, comments, and reviews updates.*/}
            {/*            </Typography>*/}
            {/*        </Stack>*/}
            {/*        <Switch checked={notifications.includes(Notifications.EMAILS_POST)}*/}
            {/*                onChange={(e, c) => {*/}
            {/*                    handleNotificationChange(Notifications.EMAILS_POST, c);*/}
            {/*                }}/>*/}
            {/*    </Stack>*/}
            {/*    <Stack*/}
            {/*        alignItems="flex-start"*/}
            {/*        direction="row"*/}
            {/*        justifyContent="space-between"*/}
            {/*        spacing={3}*/}
            {/*    >*/}
            {/*        <Stack spacing={1}>*/}
            {/*            <Typography variant="subtitle1">*/}
            {/*                Security updates*/}
            {/*            </Typography>*/}
            {/*            <Typography*/}
            {/*                variant="body2"*/}
            {/*                color="text.secondary"*/}
            {/*            >*/}
            {/*                Important notifications about your account security.*/}
            {/*            </Typography>*/}
            {/*        </Stack>*/}
            {/*        <Switch checked={notifications.includes(Notifications.EMAILS_SECURITY)}*/}
            {/*                onChange={(e, c) => {*/}
            {/*                    handleNotificationChange(Notifications.EMAILS_SECURITY, c);*/}
            {/*                }}/>*/}
            {/*    </Stack>*/}
            {/*</Stack>*/}
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1">
                  Send messages to email
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                >
                  Notifications will be sent to your email for your convenience
                </Typography>
              </Stack>
              <Switch checked={notifications.includes(Notifications.EVENTS_NOTIFICATIONS)}
                value={notifications.includes(Notifications.EVENTS_NOTIFICATIONS)}
                onChange={(e, c) => {
                  handleNotificationChange(Notifications.EVENTS_NOTIFICATIONS, c);
                }} />
            </Stack>
          </Grid>
        </Grid>
        {/*<Divider sx={{ my: 3 }} />
      <Grid
        container
        spacing={3}
      >
        <Grid
          xs={12}
          md={4}
        >
          <Typography variant="h6">
            Phone notifications
          </Typography>
        </Grid>
        <Grid
          xs={12}
          sm={12}
          md={8}
        >
          <Stack
            divider={<Divider />}
            spacing={3}
          >
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1">
                  Security updates
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                >
                  Important notifications about your account security.
                </Typography>
              </Stack>
              <Switch />
            </Stack>
          </Stack>
        </Grid>
      </Grid>*/}
      </CardContent>
    </Card>
  );
}
