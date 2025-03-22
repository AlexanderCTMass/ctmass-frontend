import {useState} from "react";
import {Box, Link, Typography} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const PortfolioCard = ({project, onClick, onEdit, onDelete, editMode}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const totalLikes = project.images.reduce((total, image) => total + (image?.likes?.length || 0), 0);

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit(project);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setIsDeleting(true);
        setTimeout(() => {
            onDelete(project);
        }, 300);
    };

    return (
        <Box
            sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 2,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                "&:hover": {transform: "translateY(-4px)", boxShadow: 4},
                opacity: isDeleting ? 0 : 1,
                transform: isDeleting ? "scale(0.9)" : "scale(1)",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick(project)}
        >
            {/* Картинка */}
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    pt: "56.25%", // 16:9
                    backgroundImage: `url(${project.thumbnail})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                {/* Затемняющая подложка */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)'
                    }}
                />

                {/* Метаданные с подложкой */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 16,
                        left: 16,
                        display: "flex",
                        gap: 2,
                        bgcolor: "rgba(0,0,0,0.6)", // Полупрозрачный фон
                        borderRadius: 1,
                        px: 1,
                        py: 0.5
                    }}
                >
                    <Box sx={{display: "flex", alignItems: "center", color: "white"}}>
                        <FavoriteBorderIcon fontSize="small"/>
                        <Typography variant="body2" ml={0.5}>
                            {totalLikes}
                        </Typography>
                    </Box>
                    <Box sx={{display: "flex", alignItems: "center", color: "white"}}>
                        <PhotoLibraryOutlinedIcon fontSize="small"/>
                        <Typography variant="body2" ml={0.5}>
                            {project.images?.length}
                        </Typography>
                    </Box>
                </Box>

                {/* Кнопки редактирования и удаления */}
                {editMode && (
                    <Box sx={{position: "absolute", top: 10, right: 10, display: "flex", gap: 1}}>
                        <Box
                            sx={{
                                bgcolor: "rgba(255,255,255,0.8)",
                                borderRadius: "50%",
                                p: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                "&:hover": {bgcolor: "rgba(255,255,255,1)"}
                            }}
                            onClick={handleEdit}
                        >
                            <EditIcon fontSize="small"/>
                        </Box>
                        <Box
                            sx={{
                                bgcolor: "rgba(255,255,255,0.8)",
                                borderRadius: "50%",
                                p: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                "&:hover": {bgcolor: "rgba(255,255,255,1)"}
                            }}
                            onClick={handleDelete}
                        >
                            <DeleteIcon fontSize="small"/>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Текстовое описание */}
            <Box sx={{p: 2}}>
                <Typography variant="h6">{project.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {isExpanded
                        ? project.shortDescription
                        : project.shortDescription.slice(0, 200)}
                    {project.shortDescription.length > 200 && !isExpanded && (
                        <>
                            ...{' '}
                            <Link
                                component="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(true);
                                }}
                                sx={{
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Show more
                            </Link>
                        </>
                    )}
                    {isExpanded && (
                        <Link
                            component="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(false);
                            }}
                            sx={{
                                color: 'primary.main',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' },
                                ml: 0.5
                            }}
                        >
                            Show less
                        </Link>
                    )}
                </Typography>
            </Box>
        </Box>
    );
};

export default PortfolioCard;
