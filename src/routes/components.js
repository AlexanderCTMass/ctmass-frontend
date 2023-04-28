import { lazy } from 'react';
import { Layout as ComponentsLayout } from 'src/layouts/components';

const IndexPage = lazy(() => import('src/pages/components/index'));
const ButtonsPage = lazy(() => import('src/pages/components/buttons'));
const ChartsPage = lazy(() => import('src/pages/components/charts'));
const ColorsPage = lazy(() => import('src/pages/components/colors'));
const DetailListsPage = lazy(() => import('src/pages/components/data-display/detail-lists'));
const QuickStatsPage = lazy(() => import('src/pages/components/data-display/quick-stats'));
const TablesPage = lazy(() => import('src/pages/components/data-display/tables'));
const FormsPage = lazy(() => import('src/pages/components/forms'));
const InputsPage = lazy(() => import('src/pages/components/inputs'));
const GridListsPage = lazy(() => import('src/pages/components/lists/grid-lists'));
const GroupedListsPage = lazy(() => import('src/pages/components/lists/grouped-lists'));
const ModalsPage = lazy(() => import('src/pages/components/modals'));
const TypographyPage = lazy(() => import('src/pages/components/typography'));

export const componentsRoutes = [
  {
    path: 'components',
    children: [
      {
        index: true,
        element: <IndexPage />
      },
      {
        path: 'buttons',
        element: (
          <ComponentsLayout title="Buttons">
            <ButtonsPage />
          </ComponentsLayout>
        )
      },
      {
        path: 'charts',
        element: (
          <ComponentsLayout title="Charts">
            <ChartsPage />
          </ComponentsLayout>
        )
      },
      {
        path: 'colors',
        element: (
          <ComponentsLayout title="Colors">
            <ColorsPage />
          </ComponentsLayout>
        )
      },
      {
        path: 'data-display',
        children: [
          {
            path: 'detail-lists',
            element: (
              <ComponentsLayout title="Detail Lists">
                <DetailListsPage />
              </ComponentsLayout>
            )
          },
          {
            path: 'quick-stats',
            element: (
              <ComponentsLayout title="Quick Stats">
                <QuickStatsPage />
              </ComponentsLayout>
            )
          },
          {
            path: 'tables',
            element: (
              <ComponentsLayout title="Tables">
                <TablesPage />
              </ComponentsLayout>
            )
          }
        ]
      },
      {
        path: 'forms',
        element: (
          <ComponentsLayout title="Forms">
            <FormsPage />
          </ComponentsLayout>
        )
      },
      {
        path: 'inputs',
        element: (
          <ComponentsLayout title="Inputs">
            <InputsPage />
          </ComponentsLayout>
        )
      },
      {
        path: 'lists',
        children: [
          {
            path: 'grid-lists',
            element: (
              <ComponentsLayout title="Grid Lists">
                <GridListsPage />
              </ComponentsLayout>
            )
          },
          {
            path: 'grouped-lists',
            element: (
              <ComponentsLayout title="Grouped Lists">
                <GroupedListsPage />
              </ComponentsLayout>
            )
          }
        ]
      },
      {
        path: 'modals',
        element: (
          <ComponentsLayout title="Modals">
            <ModalsPage />
          </ComponentsLayout>
        )
      },
      {
        path: 'typography',
        element: (
          <ComponentsLayout title="Typography">
            <TypographyPage />
          </ComponentsLayout>
        )
      }
    ]
  }
];
