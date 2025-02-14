import styles from './PortfolioGrid.module.css';
import PortfolioCard from "./PortfolioCard";
import {Box, Button, Typography} from "@mui/material";
import React, {useCallback, useState} from "react";
import {Add} from "@mui/icons-material";
import ProjectEditorModal from "./ProjectEditorModal";
import {extendedProfileApi} from "../portfolio/data/extendedProfileApi";

const PortfolioGrid = ({portfolio, setProfile, onCardClick, editMode, userId}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentPortfolio, setCurrentPortfolio] = useState(null);
    const [editIndex, setEditIndex] = useState(null);

    const openEditDialog = useCallback((index) => {
        setEditIndex(index); // Устанавливаем индекс редактируемого портфолио
        setCurrentPortfolio(portfolio[index]); // Устанавливаем текущее портфолио для редактирования
        setDialogOpen(true);
    }, [portfolio]);

    const handleSavePortfolio = useCallback((newPortfolio) => {
        setProfile(prev => {
            const updatedPortfolio = [...prev.portfolio];
            if (editIndex !== null) {
                // Редактирование существующего портфолио
                updatedPortfolio[editIndex] = newPortfolio;
            } else {
                // Добавление нового портфолио
                updatedPortfolio.push(newPortfolio);
            }
            return { ...prev, portfolio: updatedPortfolio };
        });
        setDialogOpen(false);
        setCurrentPortfolio(null);
        setEditIndex(null);
    }, [editIndex, setProfile]);

    const handleDelete = (port) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            setProfile(prev => ({
                ...prev,
                portfolio: prev.portfolio.filter((p) => p.id !== port.id),
            }));
        }
    };

    return (
        <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                PORTFOLIO
            </Typography>
            {(!portfolio || portfolio.length === 0) &&
                <Typography color="secondary">there is no completed portfolio information</Typography>}

            {editMode && (
                <Button
                    variant="outlined"
                    startIcon={<Add/>}
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
                {portfolio?.map((port, index) => (
                    <PortfolioCard
                        key={port.id}
                        project={port}
                        onClick={onCardClick}
                        onEdit={()=>openEditDialog(index)}
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
                    // onClick={openGallery}
                    sx={{
                        marginTop: 2,
                        backgroundColor: 'background.default',
                        '&:hover': {backgroundColor: 'action.hover'}
                    }}
                >
                    View All Projects ({portfolio?.length})
                </Button>)}

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