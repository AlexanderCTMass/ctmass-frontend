import { paths } from "src/paths";
import { Avatar, Box, Card, Divider, Link, Rating, Stack, SvgIcon, Tooltip, Typography } from "@mui/material";
import { RouterLink } from "src/components/router-link";
import VerifiedIcon from "@mui/icons-material/Verified";
import Fancybox from "src/components/myfancy/myfancybox";
import { getFileExtension, getFileType } from "src/utils/get-file-type";
import { FileIcon } from "src/components/file-icon";
import Users01Icon from "@untitled-ui/icons-react/build/esm/Users01";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import PropTypes from "prop-types";
import React from "react";

const avatarStyles = {
    width: 100,
    height: 130,
    borderRadius: 2
};

export const SpecialistCard = ({ specialist, smUp }) => {
    const replaceValue = specialist.profilePage || specialist.id;
    const href = paths.specialist.publicPage.replace(":profileId", replaceValue);
    return (
        <Card variant="outlined" sx={{ p: 2 }}>
            <Stack
                alignItems="start"
                direction="row"
                sx={{
                    px: smUp ? 2 : "10px",
                    pt: 1.5
                }}
                spacing={2}
                useFlexGap
            >
                {smUp && (
                    <Link href={href} component={RouterLink}>
                        <Avatar
                            variant="square"
                            src={specialist.avatar}
                            sx={{
                                ...avatarStyles
                            }}
                            alt={`${specialist.businessName}'s avatar`}

                        />
                    </Link>
                )}
                <Stack direction="column" spacing={1} sx={{ width: "100%" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        {!smUp && (
                            <Link href={href} component={RouterLink}>

                                <Avatar
                                    src={specialist.avatar}
                                    variant="square"
                                    sx={{
                                        opacity: 1
                                    }}
                                    alt={`${specialist.businessName}'s avatar`}
                                />
                            </Link>
                        )}
                        <Stack spacing={1}>
                            <Link
                                color="text.primary"
                                href={href}
                                component={RouterLink}
                            >
                                <Typography variant="h5">
                                    {specialist.businessName}
                                </Typography>
                            </Link>
                            <Typography variant="caption" color="text.secondary">
                                {specialist.since}
                            </Typography>
                            {smUp && (
                                <Stack direction="column" sx={{ px: 2 }}>
                                    <div dangerouslySetInnerHTML={{ __html: specialist.description }} />
                                </Stack>
                            )}
                        </Stack>
                        {smUp && (
                            <Tooltip title="Profile verified">
                                <SvgIcon color="success" fontSize="large">
                                    <VerifiedIcon />
                                </SvgIcon>
                            </Tooltip>
                        )}
                    </Stack>
                    {!smUp && (
                        <Stack direction="column" sx={{ px: 0 }}>
                            <div dangerouslySetInnerHTML={{ __html: specialist.description }} />
                        </Stack>
                    )}
                    {specialist.gallery?.length > 0 && (
                        <Stack sx={{ py: 4 }}>
                            <Typography color="text.secondary" variant="overline">
                                Gallery from projects:
                            </Typography>
                            <Fancybox
                                options={{
                                    Carousel: {
                                        infinite: false,
                                    },
                                }}
                            >
                                {specialist.gallery.map((item) => {
                                    const fileType = getFileType(item);
                                    if (fileType === "video") {
                                        return (
                                            <a data-fancybox="gallery" href={item} className="my-fancy-link" key={item}>
                                                <video muted preload="metadata" controls={false}>
                                                    <source src={item} />
                                                </video>
                                            </a>
                                        );
                                    } else if (fileType === "image") {
                                        return (
                                            <a data-fancybox="gallery" href={item} className="my-fancy-link" key={item}>
                                                <img src={item} alt="Project gallery" />
                                            </a>
                                        );
                                    } else {
                                        return (
                                            <a data-fancybox="gallery" href={item} className="my-fancy-link" key={item}>
                                                <FileIcon extension={getFileExtension(item)} />
                                            </a>
                                        );
                                    }
                                })}
                            </Fancybox>
                        </Stack>
                    )}
                    <Divider />
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 2,
                            py: 1
                        }}
                    >
                        <Stack
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ minWidth: 120 }}
                            spacing={0.5}
                        >
                            <Link href={href} component={RouterLink} underline="none" color="inherit">
                                <Stack direction="column" alignItems="center" spacing={0.5}>
                                    <SvgIcon fontSize="small">
                                        <Users01Icon />
                                    </SvgIcon>
                                    <Typography color="text.secondary" variant="caption" align="center">
                                        {specialist.commonContacts} connections in common
                                    </Typography>
                                </Stack>
                            </Link>
                        </Stack>

                        <Stack
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ minWidth: 120 }}
                            spacing={0.5}
                        >
                            <Link href={href} component={RouterLink} underline="none" color="inherit">
                                <Stack direction="column" alignItems="center" spacing={0.5}>
                                    <SvgIcon fontSize="small">
                                        <FactCheckIcon />
                                    </SvgIcon>
                                    <Typography color="text.secondary" variant="caption" align="center">
                                        {specialist.completedProjects} completed projects
                                    </Typography>
                                </Stack>
                            </Link>
                        </Stack>

                        <Stack
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ minWidth: 120 }}
                            spacing={0.5}
                        >
                            <Link href={href} component={RouterLink} underline="none" color="inherit">
                                <Stack direction="column" alignItems="center" spacing={0.5}>
                                    <SvgIcon fontSize="small">
                                        <RateReviewIcon />
                                    </SvgIcon>
                                    <Typography color="text.secondary" variant="caption" align="center">
                                        {specialist.reviewsLength} reviews
                                    </Typography>
                                </Stack>
                            </Link>
                        </Stack>
                        {/* <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: smUp ? "row" : "column",
                        }}
                    >
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                justifyContent: "flex-start",
                                py: 1
                            }}
                        >
                            <SvgIcon>
                                <Users01Icon sx={{ color: "6C737F" }} />
                            </SvgIcon>
                            <Link href={href} component={RouterLink}>
                                <Typography color="text.secondary" sx={{ ml: 1 }} variant="subtitle2">
                                    {specialist.commonContacts} connections in common
                                </Typography>
                            </Link>
                        </Box>

                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                ml: 2,
                                justifyContent: "flex-start",
                                py: 1
                            }}
                        >
                            <SvgIcon>
                                <FactCheckIcon sx={{ color: "6C737F" }} />
                            </SvgIcon>
                            <Link href={href} component={RouterLink}>
                                <Typography color="text.secondary" sx={{ ml: 1 }} variant="subtitle2">
                                    {specialist.completedProjects} completed projects
                                </Typography>
                            </Link>
                        </Box>

                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                ml: 2,
                                justifyContent: "flex-start",
                                py: 1
                            }}
                        >
                            <SvgIcon>
                                <RateReviewIcon sx={{ color: "6C737F" }} />
                            </SvgIcon>
                            <Link href={href} component={RouterLink}>
                                <Typography color="text.secondary" sx={{ ml: 1 }} variant="subtitle2">
                                    {specialist.reviewsLength} reviews
                                </Typography>
                            </Link>
                        </Box> */}

                        <Box sx={{ flexGrow: 1 }} />
                        <Stack direction="row" alignItems="center">
                            <Rating
                                readOnly
                                precision={0.1}
                                size="large"
                                value={specialist.rating}
                            />
                            <Typography color="text.secondary" sx={{ ml: 1 }} variant="subtitle2">
                                {specialist.rating.toFixed(1)}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
            </Stack>
        </Card>
    );
};

SpecialistCard.propTypes = {
    specialist: PropTypes.object.isRequired,
    smUp: PropTypes.bool.isRequired
};