import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {useKindOfServicesMap} from "../../../../hooks/use-kind-of-services";
import {Box, Button, CardActions, Stack} from "@mui/material";
import Grid from "@mui/material/Grid";


const SpecialityCard = (props) => {
    const {speciality, onClick} = props;
    const kindOfServicesMap = useKindOfServicesMap();

    console.log(kindOfServicesMap.find((kind) => kind.key === speciality.parent));
    //
    const parent = kindOfServicesMap.find((kind) => kind.key === speciality.parent).value;
    return (
        <Card
            onClick={() => onClick(speciality, parent)}
            sx={{
                ':hover': {
                    boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`,
                    cursor: 'pointer'
                },
            }}>
            <CardContent>
                <Stack direction="row"
                       justifyContent="space-between"
                       alignItems="center">
                    <Box>
                        <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                            {parent.label}
                        </Typography>
                        <Typography variant="h5" component="div">
                            {speciality.label}
                        </Typography>
                    </Box>
                    <Box>
                        {/*<Typography sx={{fontSize: 14, ml: 2}} color="text.secondary">
                            You provide 9 services
                        </Typography>*/}
                        <Button>
                            Add services
                        </Button>
                    </Box>
                </Stack>
            </CardContent>

        </Card>
    );
};
export default SpecialityCard;