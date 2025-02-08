import {useState} from 'react';
import styles from './PortfolioCard.module.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


const PortfolioCard = ({project, onClick, onEdit, onDelete, editMode}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Состояние для анимации удаления

    const handleEdit = (e) => {
        e.stopPropagation(); // Останавливаем всплытие события
        onEdit(project); // Вызываем функцию редактирования
    };

    const handleDelete = (e) => {
        e.stopPropagation(); // Останавливаем всплытие события
        onDelete(project); // Вызываем функцию удаления
        setTimeout(() => {
            onDelete(project); // Удаляем проект после завершения анимации
        }, 300);
    };

    return (
        <div
            className={`${styles.cardContainer} ${isDeleting ? styles.fadeOut : ''}`} // Добавляем класс для анимации
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

                    <div className={styles.imageOverlay}/>

                    {/* Иконка редактирования */}
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
                        <div className={styles.metaItem} style={{cursor: 'pointer'}}>
                            <FavoriteBorderIcon/>
                            {project.likes}
                        </div>
                        <div className={styles.metaItem}>
                            <PhotoLibraryOutlinedIcon/>
                            {project?.comments?.length}
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