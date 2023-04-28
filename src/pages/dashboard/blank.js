import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useSettings } from 'src/hooks/use-settings';

const Page = () => {
  const settings = useSettings();

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Blank" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Stack
            spacing={{
              xs: 3,
              lg: 4
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <div>
                <Typography variant="h4">
                  Blank
                </Typography>
              </div>
              <div>
                <Stack
                  direction="row"
                  spacing={4}
                >
                  <Button
                    startIcon={(
                      <SvgIcon>
                        <PlusIcon />
                      </SvgIcon>
                    )}
                    variant="contained"
                  >
                    Action
                  </Button>
                </Stack>
              </div>
            </Stack>
            <Box
              sx={{
                borderColor: 'neutral.300',
                borderStyle: 'dashed',
                borderWidth: 1,
                height: 300,
                p: '4px'
              }}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
