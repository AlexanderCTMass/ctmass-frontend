import {useState} from 'react';
import styles from './PortfolioCard.module.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const PortfolioCard = ({ project, onClick, onEdit, onDelete, editMode, userId }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Подсчет общего количества лайков для проекта
    const totalLikes = project.images.reduce((total, image) => total + image?.likes?.length, 0);

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit(project);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setIsDeleting(true); // Запускаем анимацию удаления
        setTimeout(() => {
            onDelete(project); // Удаляем проект после завершения анимации
        }, 300);
    };

    return (
        <div
            className={`${styles.cardContainer} ${isDeleting ? styles.fadeOut : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick(project)}
        >
            <div className={`${styles.card} ${isHovered ? styles.hovered : ''}`}>
                <div className={styles.imageContainer}>
                    <img
                        src={project.thumbnail}
                        alt={project.title}
                        className={styles.image}
                    />

                    <div className={styles.imageOverlay} />

                    {/* Иконки редактирования и удаления */}
                    {editMode && (
                        <div className={styles.actions}>
                            <div className={styles.editIcon} onClick={handleEdit}>
                                <EditIcon fontSize="small"/>
                            </div>
                            <div className={styles.deleteIcon} onClick={handleDelete}>
                                <DeleteIcon fontSize="small"/>
                            </div>
                        </div>
                    )}

                    <div className={styles.cardMeta}>
                        {/* Общее количество лайков для проекта */}
                        <div className={styles.metaItem} style={{ cursor: 'pointer' }}>
                            {<FavoriteBorderIcon />}
                            {totalLikes ? totalLikes : 0}
                        </div>
                        <div className={styles.metaItem}>
                            <PhotoLibraryOutlinedIcon />
                            {project.images.length}
                        </div>
                    </div>
                </div>

                <div className={styles.cardContent}>
                    <h3 className={styles.title}>{project.title}</h3>
                    <p className={styles.description}>{project.shortDescription}</p>
                </div>
            </div>
        </div>
    );
};

export default PortfolioCard;