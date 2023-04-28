import { Box, Container, Stack } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Previewer } from 'src/sections/components/previewer';
import { GroupedList1 } from 'src/sections/components/grouped-lists/grouped-list-1';
import { GroupedList2 } from 'src/sections/components/grouped-lists/grouped-list-2';
import { GroupedList3 } from 'src/sections/components/grouped-lists/grouped-list-3';
import { GroupedList4 } from 'src/sections/components/grouped-lists/grouped-list-4';
import { GroupedList5 } from 'src/sections/components/grouped-lists/grouped-list-5';
import { GroupedList6 } from 'src/sections/components/grouped-lists/grouped-list-6';
import { GroupedList7 } from 'src/sections/components/grouped-lists/grouped-list-7';
import { GroupedList8 } from 'src/sections/components/grouped-lists/grouped-list-8';
import { GroupedList9 } from 'src/sections/components/grouped-lists/grouped-list-9';
import { GroupedList10 } from 'src/sections/components/grouped-lists/grouped-list-10';
import { GroupedList11 } from 'src/sections/components/grouped-lists/grouped-list-11';

const components = [
  {
    element: <GroupedList1 />,
    title: 'Grouped list 1'
  },
  {
    element: <GroupedList2 />,
    title: 'Grouped list 2'
  },
  {
    element: <GroupedList3 />,
    title: 'Grouped list 3'
  },
  {
    element: <GroupedList4 />,
    title: 'Grouped list 4'
  },
  {
    element: <GroupedList5 />,
    title: 'Grouped list 5'
  },
  {
    element: <GroupedList6 />,
    title: 'Grouped list 6'
  },
  {
    element: <GroupedList7 />,
    title: 'Grouped list 7'
  },
  {
    element: <GroupedList8 />,
    title: 'Grouped list 8'
  },
  {
    element: <GroupedList9 />,
    title: 'Grouped list 9'
  },
  {
    element: <GroupedList10 />,
    title: 'Grouped list 10'
  },
  {
    element: <GroupedList11 />,
    title: 'Grouped list 11'
  }
];

const Page = () => {
  usePageView();

  return (
    <>
      <Seo title="Components: Grouped Lists" />
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
