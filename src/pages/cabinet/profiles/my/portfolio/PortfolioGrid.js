import styles from './PortfolioGrid.module.css';
import PortfolioCard from "./PortfolioCard";
import {Box, Button, IconButton, Modal, Typography} from "@mui/material";
import React, {useCallback, useState} from "react";
import {Add} from "@mui/icons-material";
import ProjectEditorModal from "./ProjectEditorModal";
import CloseIcon from '@mui/icons-material/Close';

const PortfolioGrid = ({portfolio, setProfile, onCardClick, editMode, userId}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentPortfolio, setCurrentPortfolio] = useState(null);
    const [editIndex, setEditIndex] = useState(null);

    const openEditDialog = useCallback((index) => {
        setEditIndex(index);
        setCurrentPortfolio(portfolio[index]);
        setDialogOpen(true);
    }, [portfolio]);

    const handleSavePortfolio = useCallback((newPortfolio) => {
        setProfile(prev => {
            const updatedPortfolio = [...prev.portfolio];
            if (editIndex !== null) {
                updatedPortfolio[editIndex] = newPortfolio;
            } else {
                updatedPortfolio.push(newPortfolio);
            }
            return {...prev, portfolio: updatedPortfolio};
        });
        setDialogOpen(false);
        setCurrentPortfolio(null);
        setEditIndex(null);
    }, [editIndex, setProfile]);

    const handleDelete = (port) => {
        if (window.confirm('Are you sure you want to delete this projects?')) {
            setProfile(prev => ({
                ...prev,
                portfolio: prev.portfolio.filter((p) => p.id !== port.id),
            }));
        }
    };

    const openGallery = () => {
        setIsGalleryOpen(true);
    };

    const closeGallery = () => {
        setIsGalleryOpen(false);
    };

    return (
        <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{mb: 1}}>
                PORTFOLIO
            </Typography>
            {(!portfolio || portfolio.length === 0) &&
                <Typography color="text.secondary" fontSize="14px">there is no completed portfolio
                    information</Typography>}

            {editMode && (
                <Button
                    variant="outlined"
                    startIcon={<Add/>}
                    sx={{mb: 1}}
                    onClick={() => {
                        setCurrentPortfolio({
                            id: Date.now().toString(),
                            title: "",
                            shortDescription: "",
                            date: "",
                            images: [],
                            thumbnail: "",
                        });
                        setDialogOpen(true);
                    }}
                >
                    Add project
                </Button>
            )}

            <div className={styles.gridContainer}>
                {portfolio?.slice(0, 3).map((port, index) => (
                    <PortfolioCard
                        key={port.id}
                        project={port}
                        onClick={onCardClick}
                        onEdit={() => openEditDialog(index)}
                        onDelete={handleDelete}
                        editMode={editMode}
                        userId={userId}
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

            <Modal
                open={isGalleryOpen}
                onClose={closeGallery}
                aria-labelledby="gallery-modal-title"
                aria-describedby="gallery-modal-description"
            >
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
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end', // Выравниваем кнопку по правому краю
                    }}>
                        <IconButton
                            onClick={closeGallery}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </Box>

                    <Typography variant="h6" id="gallery-modal-title" gutterBottom>
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
                                editMode={editMode}
                                userId={userId}
                            />
                        ))}
                    </div>
                </Box>
            </Modal>

            <ProjectEditorModal open={dialogOpen}
                                onClose={() => {
                                    setDialogOpen(false);
                                    setCurrentPortfolio(null);
                                }}
                                initialProject={currentPortfolio}
                                setSelectedProject={setCurrentPortfolio}
                                userId={userId}
                                onSave={handleSavePortfolio}
            />
        </Box>
    );
};

export default PortfolioGrid;