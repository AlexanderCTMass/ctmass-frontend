import { useCallback, useEffect, useState } from 'react';
import MessageChatSquareIcon from '@untitled-ui/icons-react/build/esm/MessageChatSquare';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import UserPlus02Icon from '@untitled-ui/icons-react/build/esm/UserPlus02';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { socialApi } from 'src/api/social';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { SocialConnections } from 'src/sections/dashboard/social/social-connections';
import { SocialTimeline } from 'src/sections/dashboard/social/social-timeline';

const tabs = [
  { label: 'Timeline', value: 'timeline' },
  { label: 'Connections', value: 'connections' }
];

const useProfile = () => {
  const isMounted = useMounted();
  const [profile, setProfile] = useState(null);

  const handleProfileGet = useCallback(async () => {
    try {
      const response = await socialApi.getProfile();

      if (isMounted()) {
        setProfile(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
      handleProfileGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return profile;
};

const usePosts = () => {
  const isMounted = useMounted();
  const [posts, setPosts] = useState([]);

  const handlePostsGet = useCallback(async () => {
    try {
      const response = await socialApi.getPosts();

      if (isMounted()) {
        setPosts(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
      handlePostsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return posts;
};

const useConnections = (search = '') => {
  const [connections, setConnections] = useState([]);
  const isMounted = useMounted();

  const handleConnectionsGet = useCallback(async () => {
    const response = await socialApi.getConnections();

    if (isMounted()) {
      setConnections(response);
    }
  }, [isMounted]);

  useEffect(() => {
      handleConnectionsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search]);

  return connections.filter((connection) => {
    return connection.name?.toLowerCase().includes(search);
  });
};

export const Page = () => {
  const profile = useProfile();
  const [currentTab, setCurrentTab] = useState('timeline');
  const [status, setStatus] = useState('not_connected');
  const posts = usePosts();
  const [connectionsQuery, setConnectionsQuery] = useState('');
  const connections = useConnections(connectionsQuery);

  usePageView();

  const handleConnectionAdd = useCallback(() => {
    setStatus('pending');
  }, []);

  const handleConnectionRemove = useCallback(() => {
    setStatus('not_connected');
  }, []);

  const handleTabsChange = useCallback((event, value) => {
    setCurrentTab(value);
  }, []);

  const handleConnectionsQueryChange = useCallback((event) => {
    setConnectionsQuery(event.target.value);
  }, []);

  if (!profile) {
    return null;
  }

  const showConnect = status === 'not_connected';
  const showPending = status === 'pending';

  return (
    <>
      <Seo title="Dashboard: Social Profile" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <div>
            <Box
              style={{ backgroundImage: `url(${profile.cover})` }}
              sx={{
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                borderRadius: 1,
                height: 348,
                position: 'relative',
                '&:hover': {
                  '& button': {
                    visibility: 'visible'
                  }
                }
              }}
            >
              <Button
                startIcon={(
                  <SvgIcon>
                    <Image01Icon />
                  </SvgIcon>
                )}
                sx={{
                  backgroundColor: blueGrey[900],
                  bottom: {
                    lg: 24,
                    xs: 'auto'
                  },
                  color: 'common.white',
                  position: 'absolute',
                  right: 24,
                  top: {
                    lg: 'auto',
                    xs: 24
                  },
                  visibility: 'hidden',
                  '&:hover': {
                    backgroundColor: blueGrey[900]
                  }
                }}
                variant="contained"
              >
                Change Cover
              </Button>
            </Box>
            <Stack
              alignItems="center"
              direction="row"
              spacing={2}
              sx={{ mt: 5 }}
            >
              <Stack
                alignItems="center"
                direction="row"
                spacing={2}
              >
                <Avatar
                  src={profile.avatar}
                  sx={{
                    height: 64,
                    width: 64
                  }}
                />
                <div>
                  <Typography
                    color="text.secondary"
                    variant="overline"
                  >
                    {profile.bio}
                  </Typography>
                  <Typography variant="h6">
                    {profile.name}
                  </Typography>
                </div>
              </Stack>
              <Box sx={{ flexGrow: 1 }} />
              <Stack
                alignItems="center"
                direction="row"
                spacing={2}
                sx={{
                  display: {
                    md: 'block',
                    xs: 'none'
                  }
                }}
              >
                {showConnect && (
                  <Button
                    onClick={handleConnectionAdd}
                    size="small"
                    startIcon={(
                      <SvgIcon>
                        <UserPlus02Icon />
                      </SvgIcon>
                    )}
                    variant="outlined"
                  >
                    Connect
                  </Button>
                )}
                {showPending && (
                  <Button
                    color="primary"
                    onClick={handleConnectionRemove}
                    size="small"
                    variant="outlined"
                  >
                    Pending
                  </Button>
                )}
                <Button
                  component={RouterLink}
                  href={paths.dashboard.chat}
                  size="small"
                  startIcon={(
                    <SvgIcon>
                      <MessageChatSquareIcon />
                    </SvgIcon>
                  )}
                  variant="contained"
                >
                  Send Message
                </Button>
              </Stack>
              <Tooltip title="More options">
                <IconButton>
                  <SvgIcon>
                    <DotsHorizontalIcon />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            </Stack>
          </div>
          <Tabs
            indicatorColor="primary"
            onChange={handleTabsChange}
            scrollButtons="auto"
            sx={{ mt: 5 }}
            textColor="primary"
            value={currentTab}
            variant="scrollable"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
              />
            ))}
          </Tabs>
          <Divider />
          <Box sx={{ mt: 3 }}>
            {currentTab === 'timeline' && (
              <SocialTimeline
                posts={posts}
                profile={profile}
              />
            )}
            {currentTab === 'connections' && (
              <SocialConnections
                connections={connections}
                onQueryChange={handleConnectionsQueryChange}
                query={connectionsQuery}
              />
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Page;
