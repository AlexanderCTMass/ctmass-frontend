import styles from './PortfolioGrid.module.css';
import PortfolioCard from "./PortfolioCard";
import {Box, Button, IconButton, Modal, Stack, Typography, CircularProgress, Tooltip, Alert} from "@mui/material";
import {Add} from "@mui/icons-material";
import ProjectEditorModal from "./ProjectEditorModal";
import CloseIcon from '@mui/icons-material/Close';
import React, {useState, useEffect, useCallback} from 'react';
import {extendedProfileApi} from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import {ProjectWithReviewRequestDialog} from "src/components/project-with-review-request-dialog";
import {ReviewRequestDialog} from "src/components/review-request-dialog";
import {ERROR, INFO} from "src/libs/log";
import {projectFlow} from "src/flows/project/project-flow";
import toast from "react-hot-toast";
import SortablePortfolioModal from "src/pages/cabinet/profiles/my/portfolio/sortatable-portfolio-form";
import SortIcon from '@mui/icons-material/Sort';

export const usePortfolio = (userId) => {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPortfolio = useCallback(async () => {
        try {
            setLoading(true);
            const data = await extendedProfileApi.getPortfolio(userId, {publicOnly: true});
            data.sort((a, b) => {
                const aOrder = a.order !== undefined ? a.order : Infinity;
                const bOrder = b.order !== undefined ? b.order : Infinity;
                return aOrder - bOrder;
            });
            setPortfolio(data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch portfolio:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    const addProject = async (project) => {
        try {
            await fetchPortfolio();
        } catch (err) {
            throw err;
        }
    };

    const updateProject = async () => {
        try {
            await fetchPortfolio();
        } catch (err) {
            throw err;
        }
    };

    const deleteProject = async () => {
        try {
            await fetchPortfolio();
        } catch (err) {
            throw err;
        }
    };

    return {
        portfolio,
        loading,
        error,
        addProject,
        updateProject,
        deleteProject,
        refresh: fetchPortfolio
    };
};

const PortfolioGrid = ({
                           profile,
                           setProfile,
                           onCardClick,
                           userId,
                           isMyProfile,
                           updateProfileState,
                           setUpdateProfileState
                       }) => {
    const [sortModalOpen, setSortModalOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentPortfolio, setCurrentPortfolio] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [currentRequest, setCurrentRequest] = useState({
        email: '',
        message: ''
    });

    const {
        portfolio,
        loading,
        error,
        addProject,
        updateProject,
        deleteProject
    } = usePortfolio(userId);

    useEffect(() => {
        if (updateProfileState) {
            updateProject();
            setUpdateProfileState(false);
        }
    }, [updateProfileState]);

    const openEditDialog = (index) => {
        setEditIndex(index);
        setCurrentPortfolio(portfolio[index]);
        setDialogOpen(true);
    };

    const handleSavePortfolio = async (newPortfolio) => {
        try {
            if (editIndex !== null) {
                await updateProject(newPortfolio.id, newPortfolio);
            } else {
                await addProject(newPortfolio);
            }
            setDialogOpen(false);
            setCurrentPortfolio(null);
            setEditIndex(null);
        } catch (err) {
            console.error('Error saving portfolio:', err);
        }
    };

    const handleDelete = async (port) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject(port.id);
            } catch (err) {
                console.error('Error deleting portfolio:', err);
            }
        }
    };


    const resetAddDialogState = () => {
        setAddDialogOpen(false);
        setCurrentRequest({
            email: '',
            message: ''
        });
    };

    const handleSubmitAddProject = useCallback(async (request) => {
        INFO("handleSubmitRequest", request)
        try {
            const project = {
                addToPortfolio: true,
                projectName: request.projectName,
                projectDate: request.date,
                projectDescription: request.projectDescription,
                specialtyId: request.specialty,
                location: request.location,
                files: request.files?.map(f => ({url: f.preview, description: f.description || ""})) || []
            };
            INFO("handleOnNext", request, project);
            const user = profile?.profile;
            await projectFlow.sendReviewRequestPastClients(user.id, user.name, user.email, project, request.email, request.message);
            toast.success("Request successfully sent!");
            setProfile(profile);
            setUpdateProfileState(true);
        } catch (e) {
            ERROR(e);
            toast.error(e.message);
        }

        resetAddDialogState();
    }, [currentRequest]);

    const openGallery = () => setIsGalleryOpen(true);
    const closeGallery = () => setIsGalleryOpen(false);

    if (loading) {
        return (
            <Box>
                <Stack>
                    <Typography variant="h6" color="text.secondary" gutterBottom sx={{mb: 1}}>
                        PORTFOLIO
                    </Typography>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress/>
                    </Box>
                </Stack>
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Stack>
                    <Typography variant="h6" color="text.secondary" gutterBottom sx={{mb: 1}}>
                        PORTFOLIO
                    </Typography>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <Typography color="error">Error loading portfolio: {error}</Typography>
                    </Box>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    PORTFOLIO
                </Typography>
                {isMyProfile && (
                    <Box>
                        <Tooltip title="Add New Portfolio Project">
                            <Add color="success"
                                 onClick={() => {
                                     setCurrentPortfolio(null);
                                     setAddDialogOpen(true);
                                 }}
                                 sx={{
                                     cursor: "pointer",
                                     transition: "transform 0.2s ease-in-out",
                                     "&:hover": {
                                         transform: "scale(1.1)",
                                     },
                                     mr: 1
                                 }}
                            />
                        </Tooltip>
                        <Tooltip title="Sort Portfolio Projects">
                            <SortIcon
                                color="success"
                                onClick={() => setSortModalOpen(true)}
                                sx={{
                                    cursor: "pointer",
                                    transition: "transform 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "scale(1.1)",
                                    },
                                }}
                            />
                        </Tooltip>
                    </Box>)}
            </Stack>

            {(!portfolio || portfolio.length === 0) &&
                (isMyProfile ?
                    <Alert severity="info">
                        <Stack direction={"column"} gap={1}>
                            <Typography variant={"body2"}>
                                You can also add a previously completed third-party project and send a request to your
                                former clients to leave feedback on the CTMASS platform.</Typography>
                            <Button onClick={() => {
                                setCurrentPortfolio(null);
                                setAddDialogOpen(true);
                            }}>Add Project</Button></Stack>
                    </Alert>
                    : <Typography color="text.secondary" fontSize="14px">There is no completed portfolio
                        information</Typography>)}

            <div className={styles.gridContainer}>
                {portfolio?.slice(0, 3).map((port, index) => (
                    <PortfolioCard
                        key={port.id}
                        project={port}
                        onClick={onCardClick}
                        onEdit={() => openEditDialog(index)}
                        onDelete={handleDelete}
                        userId={userId}
                        isMyProfile={isMyProfile}
                    />
                ))}
            </div>

            {portfolio && portfolio.length > 3 && (
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={openGallery}
                    sx={{
                        marginTop: 2,
                        '&:hover': {backgroundColor: 'action.hover'}
                    }}
                >
                    View All Projects ({portfolio?.length})
                </Button>)}

            <Modal open={isGalleryOpen} onClose={closeGallery}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 2,
                    p: 4,
                }}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <IconButton onClick={closeGallery}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                    <Typography variant="h6" gutterBottom>
                        All Projects
                    </Typography>
                    <div className={styles.gridContainer}>
                        {portfolio?.map((port, index) => (
                            <PortfolioCard
                                key={port.id}
                                project={port}
                                onClick={onCardClick}
                                onEdit={() => openEditDialog(index)}
                                onDelete={handleDelete}
                                userId={userId}
                                isMyProfile={isMyProfile}
                            />
                        ))}
                    </div>
                </Box>
            </Modal>

            <ProjectWithReviewRequestDialog
                open={addDialogOpen}
                onClose={resetAddDialogState}
                onSubmit={handleSubmitAddProject}
                currentRequest={currentRequest}
                setCurrentRequest={() => {
                }}
                isEditMode={false}
                profile={profile?.profile}
                existingRequests={[]}
            />


            <ProjectEditorModal
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setCurrentPortfolio(null);
                }}
                initialProject={currentPortfolio}
                setSelectedProject={setCurrentPortfolio}
                userId={userId}
                onSave={handleSavePortfolio}
            />
            <SortablePortfolioModal
                profileId={profile?.profile?.id}
                open={sortModalOpen}
                onClose={() => {
                    setSortModalOpen(false);
                    setProfile(profile);
                    setUpdateProfileState(true);
                }
                }
            />
        </Box>
    );
};

export default PortfolioGrid;