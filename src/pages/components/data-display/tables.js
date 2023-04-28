import { Box, Container, Stack } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Previewer } from 'src/sections/components/previewer';
import { Table1 } from 'src/sections/components/tables/table-1';
import { Table2 } from 'src/sections/components/tables/table-2';
import { Table3 } from 'src/sections/components/tables/table-3';
import { Table4 } from 'src/sections/components/tables/table-4';
import { Table5 } from 'src/sections/components/tables/table-5';
import { Table6 } from 'src/sections/components/tables/table-6';
import { Table7 } from 'src/sections/components/tables/table-7';
import { Table8 } from 'src/sections/components/tables/table-8';
import { Table9 } from 'src/sections/components/tables/table-9';
import { Table10 } from 'src/sections/components/tables/table-10';
import { Table11 } from 'src/sections/components/tables/table-11';

const components = [
  {
    element: <Table1 />,
    title: 'Table 1'
  },
  {
    element: <Table2 />,
    title: 'Table 2'
  },
  {
    element: <Table3 />,
    title: 'Table 3'
  },
  {
    element: <Table4 />,
    title: 'Table 4'
  },
  {
    element: <Table5 />,
    title: 'Table 5'
  },
  {
    element: <Table6 />,
    title: 'Table 6'
  },
  {
    element: <Table7 />,
    title: 'Table 7'
  },
  {
    element: <Table8 />,
    title: 'Table 8'
  },
  {
    element: <Table9 />,
    title: 'Table 9'
  },
  {
    element: <Table10 />,
    title: 'Table 10'
  },
  {
    element: <Table11 />,
    title: 'Table 11'
  }
];

const Page = () => {
  usePageView();

  return (
    <>
      <Seo title="Components: Tables" />
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
