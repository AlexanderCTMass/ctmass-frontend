import {
    Avatar,
    Container,
    Link,
    ListItemText,
    Rating,
    Stack,
    SvgIcon,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery
} from '@mui/material';
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useMounted} from "../../hooks/use-mounted";
import {servicesFeedApi} from "../../api/servicesFeed";
import {Scrollbar} from "../../components/scrollbar";
import HeartIcon from "@untitled-ui/icons-react/build/esm/Heart";
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';

const now = new Date();


export const useContractors = () => {
    const [contractors, setContractors] = useState([]);
    const isMounted = useMounted();

    const handleContractorsGet = useCallback(async () => {
        let response = await servicesFeedApi.getProjects();
        const projects = [];
        response.forEach((doc) => {
            projects.push({...doc.id, ...doc.data()});
        })

        response = await servicesFeedApi.getContractors();
        const profiles = [];
        response.forEach((doc) => {
            const id = doc.id;
            const userProjects = projects.filter((p) => p.userId === id);
            const ratingsProjects = userProjects.filter((p) => p.rating > 0);
            profiles.push({
                id: id,
                ...doc.data(),
                projectsCounts: userProjects.length || 0,
                projectsLikes: userProjects.reduce((sum, item) => sum + (item.likes ? item.likes.length : 0), 0) || 0,
                fullRating: ratingsProjects.reduce((sum, item) => sum + item.rating, 0) / ratingsProjects.length || 0,
                ratingCounts: ratingsProjects.length
            });
        });

        // Сортируем массив по ratings, likes и counts
        const sortedData = profiles.sort((a, b) => {
            if (b.fullRating !== a.fullRating) return b.fullRating - a.fullRating; // Сортировка по ratings
            if (b.projectsLikes !== a.projectsLikes) return b.projectsLikes - a.projectsLikes;         // Сортировка по likes
            return b.projectsCounts - a.projectsCounts;                                // Сортировка по counts
        });

        // Берем первые 6 элементов
        const top6 = sortedData.slice(0, 6);

        if (isMounted()) {
            setContractors(top6);
        }
    }, [isMounted]);

    useEffect(() => {
            handleContractorsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return [contractors, handleContractorsGet];
};


export const HomeContractorsRating = () => {
    const [contractors, handleContractorsGet] = useContractors();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    return (
        <div>
            <Container maxWidth="lg">
                <Stack
                    spacing={mdUp ? 8 : 4}
                    sx={mdUp ? {mb: '60px'} : {}}
                >
                    <Stack spacing={2}>
                        <Typography
                            align="center"
                            variant="h3"
                        >
                            Experts in Their Field
                        </Typography>
                        <Typography
                            align="center"
                            color="text.secondary"
                            variant="subtitle1"
                        >
                            Each of our specialists brings years of experience and a proven track record to deliver
                            high-quality solutions for any challenge.
                        </Typography>
                    </Stack>
                    <Scrollbar>
                        <Table sx={mdUp ? {minWidth: 900} : {}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Contractor
                                    </TableCell>
                                    {mdUp ?
                                        (<>
                                            <TableCell>
                                                Rating
                                            </TableCell>
                                            <TableCell>
                                                Posts likes
                                            </TableCell>
                                            <TableCell>
                                                Projects
                                            </TableCell>
                                        </>) : (<TableCell>

                                        </TableCell>)}
                                    {/*   <TableCell
                                        align="right"
                                        sortDirection="desc"
                                    >
                                        Created
                                    </TableCell>*/}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {contractors.map((project) => {
                                    // const budget = numeral(projects.budget).format(`${projects.currency}0,0.00`);
                                    // const createdAt = format(projects.createdAt, 'dd MMM, yyyy');

                                    return (
                                        <TableRow
                                            hover
                                            key={project.id}
                                        >
                                            <TableCell>
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    spacing={1}
                                                >
                                                    <Avatar src={project.avatar} component="a"
                                                            sx={{
                                                                height: 55,
                                                                width: 55,
                                                                mr: 1
                                                            }}
                                                            href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + project.id}/>
                                                    <Link
                                                        color="text.primary"
                                                        href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + project.id}
                                                        variant="subtitle2"
                                                    >
                                                        {project.businessName}
                                                    </Link>
                                                </Stack>
                                                {!mdUp && <ListItemText
                                                    primary={(
                                                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                            <Rating
                                                                precision={0.5}
                                                                size="medium"
                                                                value={project.fullRating}
                                                                readOnly={true}

                                                            />
                                                            <Typography component={"legend"} variant={"subtitle2"}>
                                                                {project.fullRating.toFixed(2)}
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                    secondary={(
                                                        <Typography
                                                            color="text.secondary"
                                                            variant="body2"
                                                        >
                                                            Based on
                                                            {' '}
                                                            {project.ratingCounts}
                                                            {' '}
                                                            review
                                                        </Typography>
                                                    )}
                                                />}
                                            </TableCell>
                                            {mdUp ? (<>
                                                    <TableCell>
                                                        <ListItemText
                                                            primary={(
                                                                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                                    <Rating
                                                                        precision={0.5}
                                                                        size="medium"
                                                                        value={project.fullRating}
                                                                        readOnly={true}

                                                                    />
                                                                    <Typography component={"legend"} variant={"subtitle2"}>
                                                                        {project.fullRating.toFixed(2)}
                                                                    </Typography>
                                                                </Stack>
                                                            )}
                                                            secondary={(
                                                                <Typography
                                                                    color="text.secondary"
                                                                    variant="body2"
                                                                >
                                                                    Based on
                                                                    {' '}
                                                                    {project.ratingCounts}
                                                                    {' '}
                                                                    review
                                                                </Typography>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                            <SvgIcon
                                                                sx={{
                                                                    color: 'error.main',
                                                                    '& path': {
                                                                        fill: (theme) => theme.palette.error.main,
                                                                        fillOpacity: 1
                                                                    }
                                                                }}
                                                            >
                                                                <HeartIcon/>
                                                            </SvgIcon>
                                                            <Typography component={"legend"} variant={"subtitle2"}>
                                                                {project.projectsLikes}
                                                            </Typography>
                                                        </Stack>


                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                            <SvgIcon
                                                                sx={{
                                                                    color: 'success.main'
                                                                }}
                                                            >
                                                                <CheckIcon/>
                                                            </SvgIcon>
                                                            <Typography component={"legend"} variant={"subtitle2"}>
                                                                {project.projectsCounts}
                                                            </Typography>
                                                        </Stack>

                                                    </TableCell></>)
                                                :
                                                (<TableCell>
                                                    <Stack spacing={2}>
                                                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                            <SvgIcon
                                                                sx={{
                                                                    color: 'error.main',
                                                                    '& path': {
                                                                        fill: (theme) => theme.palette.error.main,
                                                                        fillOpacity: 1
                                                                    }
                                                                }}
                                                            >
                                                                <HeartIcon/>
                                                            </SvgIcon>
                                                            <Typography component={"legend"} variant={"subtitle2"}>
                                                                {project.projectsLikes}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                            <SvgIcon
                                                                sx={{
                                                                    color: 'success.main'
                                                                }}
                                                            >
                                                                <CheckIcon/>
                                                            </SvgIcon>
                                                            <Typography component={"legend"} variant={"subtitle2"}>
                                                                {project.projectsCounts}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </TableCell>)
                                            }
                                            {/*<TableCell>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                >
                                                    {projects.technologies.map((technology) => (
                                                        <Box
                                                            component="span"
                                                            key={technology}
                                                            sx={{
                                                                '& img': {
                                                                    height: 30
                                                                }
                                                            }}
                                                        >
                                                            <img
                                                                alt="Tech"
                                                                key={technology}
                                                                src={technologyMap[technology]}
                                                            />
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </TableCell>*/}
                                            {/* <TableCell align="right">
                                                {createdAt}
                                            </TableCell>*/}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Stack>
            </Container>
        </div>
    );
}
