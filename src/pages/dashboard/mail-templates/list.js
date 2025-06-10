import {useCallback, useEffect, useMemo, useState} from 'react';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import {Box, Button, Card, Container, Stack, SvgIcon, Typography} from '@mui/material';
import {Seo} from 'src/components/seo';
import {useMounted} from 'src/hooks/use-mounted';
import {usePageView} from 'src/hooks/use-page-view';
import {useSelection} from 'src/hooks/use-selection';
import {MailTemplateListTable} from "../../../sections/dashboard/mail-tempaltes/mail-templates-list-table";

const useMailTemplatesSearchSearch = () => {
  const [state, setState] = useState({
    filters: {
      query: undefined,
      CUSTOMER: undefined,
      WORKER: undefined
    },
    page: 0,
    rowsPerPage: 5,
    sortBy: 'updatedAt',
    sortDir: 'desc'
  });

  const handleFiltersChange = useCallback((filters) => {
    setState((prevState) => ({
      ...prevState,
      filters
    }));
  }, []);

  const handleSortChange = useCallback((sort) => {
    setState((prevState) => ({
      ...prevState,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir
    }));
  }, []);

  const handlePageChange = useCallback((event, page) => {
    setState((prevState) => ({
      ...prevState,
      page
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10)
    }));
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state
  };
};

const useMailTemplatesStore = (searchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState({
    mailTemplates: [],
    mailTemplatesCount: 0
  });

  const handleMailTemplatesGet = useCallback(async () => {
    try {
      const response = await mailTemplatesApi.getMailTemplates(searchState);

      if (isMounted()) {
        setState({
          mailTemplates: response.data,
          mailTemplatesCount: response.count
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(() => {
      handleMailTemplatesGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]);

  return {
    ...state
  };
};

const useMailTemplatesIds = (mailTemplates = []) => {
  return useMemo(() => {
    return mailTemplates.map((mailTemplate) => mailTemplate.id);
  }, [mailTemplates]);
};

const Page = () => {
  const mailTemplatesSearch = useMailTemplatesSearchSearch();
  const mailTemplatesStore = useMailTemplatesStore(mailTemplatesSearch.state);
  const mailTemplatesIds = useMailTemplatesIds(mailTemplatesStore.mailTemplates);
  const mailTemplatesSelection = useSelection(mailTemplatesIds);

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Mail Templates" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">
                  Mail Templates
                </Typography>
              </Stack>
             <Stack
                alignItems="center"
                direction="row"
                spacing={3}
              >
                <Button
                  startIcon={(
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  )}
                  variant="contained"
                >
                  Add
                </Button>
              </Stack>
            </Stack>
            <Card>
              <MailTemplateListTable
                count={mailTemplatesStore.mailTemplatesCount}
                items={mailTemplatesStore.mailTemplates}
                onDeselectAll={mailTemplatesSelection.handleDeselectAll}
                onDeselectOne={mailTemplatesSelection.handleDeselectOne}
                onPageChange={mailTemplatesSearch.handlePageChange}
                onRowsPerPageChange={mailTemplatesSearch.handleRowsPerPageChange}
                onSelectAll={mailTemplatesSelection.handleSelectAll}
                onSelectOne={mailTemplatesSelection.handleSelectOne}
                page={mailTemplatesSearch.state.page}
                rowsPerPage={mailTemplatesSearch.state.rowsPerPage}
                selected={mailTemplatesSelection.selected}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
