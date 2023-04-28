import { Box, Container, Stack } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Previewer } from 'src/sections/components/previewer';
import { GridList1 } from 'src/sections/components/grid-lists/grid-list-1';
import { GridList2 } from 'src/sections/components/grid-lists/grid-list-2';
import { GridList3 } from 'src/sections/components/grid-lists/grid-list-3';
import { GridList4 } from 'src/sections/components/grid-lists/grid-list-4';
import { GridList5 } from 'src/sections/components/grid-lists/grid-list-5';
import { GridList6 } from 'src/sections/components/grid-lists/grid-list-6';

const components = [
  {
    element: <GridList1 />,
    title: 'Grid list 1'
  },
  {
    element: <GridList2 />,
    title: 'Grid list 2'
  },
  {
    element: <GridList3 />,
    title: 'Grid list 3'
  },
  {
    element: <GridList4 />,
    title: 'Grid list 4'
  },
  {
    element: <GridList5 />,
    title: 'Grid list 5'
  },
  {
    element: <GridList6 />,
    title: 'Grid list 6'
  }
];

const Page = () => {
  usePageView();

  return (
    <>
      <Seo title="Components: Grid Lists" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={8}>
            {components.map((component) => (
              <Previewer
                key={component.title}
                title={component.title}
              >
                {component.element}
              </Previewer>
            ))}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
