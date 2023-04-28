import { Box, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { JobCreateForm } from 'src/sections/dashboard/jobs/job-create-form';

const Page = () => {
  usePageView();

  return (
    <>
      <Seo title="Dashboard: Job Create" />
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexGrow: 1
        }}
      >
        <Grid
          container
          sx={{ flexGrow: 1 }}
        >
          <Grid
            xs={12}
            sm={4}
            sx={{
              backgroundImage: 'url(/assets/people-talking.png)',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              display: {
                xs: 'none',
                md: 'block'
              }
            }}
          />
          <Grid
            xs={12}
            md={8}
            sx={{
              p: {
                xs: 4,
                sm: 6,
                md: 8
              }
            }}
          >
            <Stack
              maxWidth="sm"
              spacing={3}
            >
              <Typography variant="h4">
                Create Job Ad
              </Typography>
              <JobCreateForm />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Page;
