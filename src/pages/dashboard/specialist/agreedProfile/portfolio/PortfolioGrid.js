import styles from './PortfolioGrid.module.css';
import PortfolioCard from "./PortfolioCard";
import {Box, Button, Typography} from "@mui/material";
import React, {useState} from "react";
import {Add} from "@mui/icons-material";
import ProjectEditorModal from "./ProjectEditorModal";
import {projects} from "./data/projects";

const PortfolioGrid = ({projects, setProject, onCardClick, editMode}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const handlePortfolioSave = (updatedProject) => {
        setProject((prevProjects) => {
            if (updatedProject.id) {
                // Если проект уже есть, обновляем его в массиве
                return prevProjects.map((project) =>
                    project.id === updatedProject.id ? updatedProject : project
                );
            } else {
                // Добавляем новый проект в массив
                return [
                    ...prevProjects,
                    {
                        ...updatedProject,
                        id: Date.now(), // Генерируем новый ID
                    },
                ];
            }
        });

        setIsModalOpen(false);
    };
    const handleDelete = (project) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            setProject((prevProjects) => prevProjects.filter((p) => p.id !== project.id));
        }
    };

    const handleEdit = (project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    return (
        <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                PORTFOLIO
            </Typography>

            {editMode && (
                <Button
                    variant="outlined"
                    startIcon={<Add/>}
                    onClick={() => {
                        setIsModalOpen(true)
                    }}
                >
                    Add project
                </Button>
            )}

            <div className={styles.gridContainer}>
                {projects?.map(project => (
                    <PortfolioCard key={project.id} project={project} onClick={onCardClick} onEdit={handleEdit} onDelete={handleDelete} editMode={editMode}/>
                ))}
            </div>
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
                View All Projects ({projects.length})
            </Button>

            <ProjectEditorModal open={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setSelectedProject(null)
            }} initialProject={selectedProject} setSelectedProject={setSelectedProject}
                                onSave={handlePortfolioSave}/>
        </Box>
    );
};

export default PortfolioGrid;