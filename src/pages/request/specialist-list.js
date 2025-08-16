import { Box, Divider, Typography } from "@mui/material";
import { SpecialistMiniPreview } from "src/sections/components/specialist/specialist-mini-preview";

export const SpecialistList = (props) => {
    const { specialists, theme } = props;

    return <>
        <Typography sx={{ fontSize: "22px", fontWeight: 400, mt: 1 }}>
            <Typography
                component="span"
                sx={{
                    mr: 1,
                    background: "#DCDEE0",
                    padding: "10px",
                    borderRadius: "12px"
                }}
                variant="inherit"
            >{specialists?.length || 0}</Typography>
            specialists
        </Typography>
        <Box sx={{
            pt: 4
        }}>
            {specialists.map((specialist, index) => (
                <Box key={index} sx={{ pb: 2 }}>
                    <SpecialistMiniPreview specialist={{
                        ...specialist,
                        avatar: "https://robohash.org/user" + index + ".png?set=set2"
                    }} />
                    <Divider sx={{ pt: 2 }} />
                </Box>
            ))}
        </Box>
    </>;
}