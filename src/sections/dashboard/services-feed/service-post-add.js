import Attachment01Icon from '@untitled-ui/icons-react/build/esm/Attachment01';
import FaceSmileIcon from '@untitled-ui/icons-react/build/esm/FaceSmile';
import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import Link01Icon from '@untitled-ui/icons-react/build/esm/Link01';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VideocamIcon from '@mui/icons-material/Videocam';
import { MobileDatePicker } from '@mui/x-date-pickers';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Checkbox from '@mui/material/Checkbox';

import InputLabel from '@mui/material/InputLabel';
import {
  Avatar,
  Button,
  Card,
  Chip,
  CardContent,
  IconButton,
  OutlinedInput,
  TextField,
  Stack,
  SvgIcon,
  useMediaQuery
} from '@mui/material';
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { getInitials } from 'src/utils/get-initials';
import { useState } from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const services = [
    {title: 'Siding', id: 1},
    {title: 'Framing', id: 2},
    {title: 'Plumbing', id: 3},
    {title: 'Handyman', id: 4},
    {title: 'Dryall', id: 5},
    {title: 'Heating', id: 6},
    {title: 'A/C', id: 7},
    {title: 'Ventilation', id: 8},
    {title: 'Electrician', id: 9},
    {title: 'Hardwood floors', id: 10},
    {title: 'Roofing', id: 11},
    {title: 'Appliences repair', id: 12},
    {title: 'Tile', id: 13},
    {title: 'Bathroom specialist', id: 14},
    {title: 'Door installation', id: 15}
];
const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export const ServicePostAdd = (props) => {
  const user = useMockedUser();
  const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  const [serviceKind, setServiceKind] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setServiceKind(event.target.value);
  };
  
  return (
    <Card {...props}>
      <CardContent>
        <Stack
          alignItems="flex-start"
          direction="row"
          spacing={2}
        >
          <Avatar
            src={user.avatar}
            sx={{
              height: 40,
              width: 40
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Stack
            spacing={3}
            sx={{ flexGrow: 1 }}
          ><InputLabel id="demo-simple-select-label">Kind of construction</InputLabel>
              <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    value={serviceKind}
    label="Kind of construction"
    onChange={handleChange}
  >
    <MenuItem value={10}>Ten</MenuItem>
    <MenuItem value={20}>Twenty</MenuItem>
    <MenuItem value={30}>Thirty</MenuItem>
  </Select>
          <TextField
              fullWidth
              label="Location"
            />
            <OutlinedInput
              fullWidth
              multiline
              placeholder="Describe the main points of the order, the difficulties and how they were overcome"
              rows={3}
            />
            
            <Stack
              alignItems="center"
              direction="row"
              spacing={3}
            >
              <MobileDatePicker
                label="Start Date"
                onChange={(newDate) => setStartDate(newDate)}
                renderInput={(inputProps) => (
                  <TextField {...inputProps} />
                )}
                value={startDate}
              />
              <MobileDatePicker
                label="End Date"
                onChange={(newDate) => setEndDate(newDate)}
                renderInput={(inputProps) => (
                  <TextField {...inputProps} />
                )}
                value={endDate}
              />
            </Stack>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              {smUp && (
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <IconButton>
                    <SvgIcon>
                      <PhotoCameraIcon />
                    </SvgIcon>
                  </IconButton>
                  <IconButton>
                    <SvgIcon>
                      <VideocamIcon />
                    </SvgIcon>
                  </IconButton>
                </Stack>
              )}
              <div>
                <Button variant="contained">
                  Post
                </Button>
              </div>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
