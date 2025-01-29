import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import { Button, Stack, SvgIcon, Typography } from '@mui/material';
import {FileDropzone} from "src/components/file-dropzone";
import { QuillEditor } from 'src/components/quill-editor';

export const ProjectDescriptionStep = (props) => {
  const { onBack, onNext, project, ...other } = props;
  const [content, setContent] = useState(project.description||null);

  const handleContentChange = useCallback((value) => {
    setContent(value);
  }, []);


    const handleOnNext = () => {
        project.description = content;
        onNext(project);
    }

  return (
      <Stack
          spacing={3}
          {...other}>
          <div>
              <Typography variant="h6">
                  How would you describe the project?
              </Typography>
          </div>
          <QuillEditor
              onChange={handleContentChange}
              placeholder="Write something"
              sx={{height: 200}}
              value={content}
          />

          <div>
              <Typography variant="h6">
                  A photo or video will help the specialist to assess the situation more accurately.
              </Typography>
          </div>
          <FileDropzone
              accept={{'image/*': []}}
              maxFiles={1}
              // onDrop={handleCoverDrop}
              caption="(SVG, JPG, PNG, or gif maximum 900x400)"
          />
          <Stack
              alignItems="center"
              direction="row"
              spacing={2}
          >
              <Button
                  endIcon={(
                      <SvgIcon>
                          <ArrowRightIcon/>
                      </SvgIcon>
                  )}
                  onClick={handleOnNext}
                  variant="contained"
              >
                  Continue
              </Button>
              <Button
                  color="inherit"
                  onClick={onBack}
              >
                  Back
              </Button>
          </Stack>
      </Stack>
  );
};

ProjectDescriptionStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
