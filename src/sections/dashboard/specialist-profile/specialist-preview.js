import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import {
    Avatar,
    Box,
    Button,
    Card,
    Divider,
    IconButton, ImageList, ImageListItem,
    Rating,
    Stack,
    SvgIcon,
    Tooltip,
    Typography
} from '@mui/material';
import { dictionaryApi } from "../../../pages/components/dictionary/dictionaryApi";
import HeartIcon from "@untitled-ui/icons-react/build/esm/Heart";
import Users01Icon from "@untitled-ui/icons-react/build/esm/Users01";
import RateReviewIcon from '@mui/icons-material/RateReviewOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import * as React from "react";


const medias = [
    "/assets/gallery/gallery-1.jpg",
    "/assets/gallery/gallery-2.jpg",
    "/assets/gallery/gallery-3.jpg",
    "/assets/gallery/gallery-4.jpg"
]
export const SpecialistPreview = (props) => {
    const { profile } = props;

    return (
        <Stack spacing={2}>
            <div>
                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                    <Avatar
                        sx={{
                            backgroundColor: 'success.main',
                            color: 'success.contrastText',
                            height: 40,
                            width: 40
                        }}
                    >
                        <SvgIcon>
                            <CheckIcon />
                        </SvgIcon>
                    </Avatar>
                    <Typography
                        variant="h6"
                        sx={{ mt: 2 }}
                    >
                        All done!
                    </Typography>
                </Stack>

                {/*<Typography
                    color="text.secondary"
                    variant="body2"
                >
                    Next, you can:
                </Typography>
                <Stack
                    component="ul"
                    spacing={0.5}
                    sx={{
                        m: 0,
                        p: 0
                    }}
                >
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        add photos and videos to the completed work feed
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        add diplomas, certificates and other documents to your profile
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        start searching for orders
                    </Typography>
                </Stack>*/}
                <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{ pt: 2 }}
                >
                    Here’s a preview of your newly created specialist profile
                </Typography>
            </div>
            <Card variant="outlined">
                <Stack
                    alignItems="start"
                    direction="row"
                    sx={{
                        px: 2,
                        pt: 1.5
                    }}
                    spacing={2}
                    useFlexGap
                >
                    <Avatar
                        alt="Applicant"
                        src={profile.avatar}
                        sx={{
                            border: '3px solid #FFFFFF',
                            height: 120,
                            width: 120
                        }}
                    />
                    <Stack direction="column" spacing={1} sx={{ width: "100%" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems={"center"}>
                            <Stack spacing={1}>
                                <Typography variant="h5">
                                    {profile.name}
                                </Typography>
                                <Box
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex'
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary"
                                        sx={{ textTransform: 'uppercase' }}>
                                        category
                                    </Typography>
                                    <Box
                                        sx={{
                                            height: 4,
                                            width: 4,
                                            borderRadius: 4,
                                            backgroundColor: 'text.secondary',
                                            mx: 1
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary"
                                        sx={{ textTransform: 'uppercase' }}>
                                        specialty
                                    </Typography>
                                </Box>
                            </Stack>
                            <Tooltip title={"Profile verified"}>
                                <SvgIcon color="success" fontSize="large">
                                    <VerifiedIcon />
                                </SvgIcon>
                            </Tooltip>
                        </Stack>
                        <Divider />
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex'
                            }}
                        >
                            <Box
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                }}
                            >
                                <SvgIcon>
                                    <Users01Icon sx={{ color: "6C737F" }} />
                                </SvgIcon>
                                <Typography
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                    variant="subtitle2"
                                >
                                    {8}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    ml: 2
                                }}
                            >
                                <SvgIcon>
                                    <RateReviewIcon sx={{ color: "6C737F" }} />
                                </SvgIcon>
                                <Typography
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                    variant="subtitle2"
                                >
                                    {2}
                                </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1 }} />
                            <Rating
                                readOnly
                                precision={0.1}
                                // size="small"
                                value={4.4}
                            />
                            <Typography
                                color="text.secondary"
                                sx={{ ml: 1 }}
                                variant="subtitle2"
                            >
                                {4.4}
                            </Typography>
                        </Box>
                    </Stack>

                </Stack>
                <Stack
                    direction="column"
                    sx={{
                        px: 2
                    }}
                >
                    <div dangerouslySetInnerHTML={{ __html: profile.description }} />
                </Stack>
                <Stack sx={{
                    px: 2
                }}>
                    <ImageList cols={5} gap={8} variant="masonry" rowHeight={64}>
                        {medias.map((item) => (
                            <ImageListItem variant="quilted" key={item}>
                                <img
                                    src={`${item}`}
                                    srcSet={`${item}`}
                                    // alt={item.title}
                                    loading="lazy"
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Stack>

            </Card>
        </Stack>);
};
