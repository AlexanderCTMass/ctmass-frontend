import React, {useEffect, useRef, useState} from 'react';
import {Avatar, Box, Chip, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {AnimatePresence, motion} from 'framer-motion';
import HorizontalPreviewCard from "src/components/profiles/previewCards/horizontal-preview-card";
import {mapSpecialistToPreviewData} from "src/utils/preview-card-utils";
import PropTypes from "prop-types";
import {paths} from "src/paths";
import {useRouter} from "src/hooks/use-router";

const OrbitalAvatarCard = ({ specialist, index, total, activeIndex, orbitRadius, onClick, theme }) => {
    // Диапазон углов в градусах (от 20° до 240°)
    const MIN_ANGLE = 110;
    const MAX_ANGLE = 340;
    const ANGLE_RANGE = MAX_ANGLE - MIN_ANGLE;

    // Расчет угла для равномерного распределения в заданном диапазоне
    const baseAngle = (MIN_ANGLE + (index * (ANGLE_RANGE / (total - 1)))) * (Math.PI / 180);

    // Случайное смещение для естественности
    const offsetAngle = useRef((Math.random() - 0.5) * 0.25);

    // Ограничиваем угол
    const minRad = MIN_ANGLE * (Math.PI / 180);
    const maxRad = MAX_ANGLE * (Math.PI / 180);
    const angle = Math.min(maxRad, Math.max(minRad, baseAngle + offsetAngle.current));

    // Расчет позиции на окружности
    const x = Math.cos(angle) * orbitRadius;
    const y = Math.sin(angle) * orbitRadius;

    // Генерация случайного размера для карточки (от 60 до 110 пикселей)
    const cardSize = useRef(60 + Math.random() * 50);

    // Случайный цвет фона для разнообразия (если нет аватарки)
    const bgColor = useRef([
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ][Math.floor(Math.random() * 10)]);

    // Случайный угол поворота для карточки
    const rotateAngle = useRef((Math.random() - 0.5) * 30);

    // Случайные параметры для плавающей анимации
    const floatParams = useRef({
        xOffset: (Math.random() - 0.5) * 25,
        yOffset: (Math.random() - 0.5) * 25,
        rotateOffset: (Math.random() - 0.5) * 10,
        duration: 4 + Math.random() * 3,
        scalePulse: 0.95 + Math.random() * 0.1
    });

    // Определяем, находится ли карточка в верхней половине
    const isInUpperHalf = angle < Math.PI;

    return (
        <motion.div
            onClick={onClick}
            animate={{
                x: [x + floatParams.current.xOffset, x - floatParams.current.xOffset, x + floatParams.current.xOffset],
                y: [y + floatParams.current.yOffset, y - floatParams.current.yOffset, y + floatParams.current.yOffset],
                rotate: [
                    rotateAngle.current + floatParams.current.rotateOffset,
                    rotateAngle.current - floatParams.current.rotateOffset,
                    rotateAngle.current + floatParams.current.rotateOffset
                ],
                scale: [1, floatParams.current.scalePulse, 1]
            }}
            transition={{
                duration: floatParams.current.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }}
            whileHover={{
                scale: 1.2,
                zIndex: 20,
                rotate: 0,
                transition: { duration: 0.3 }
            }}
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                cursor: 'pointer',
                zIndex: index === activeIndex ? 15 : 5,
                filter: index === activeIndex ? 'brightness(1.1)' : 'brightness(0.95)',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                {/* Квадратная карточка */}
                <Box
                    sx={{
                        width: cardSize.current,
                        height: cardSize.current,
                        borderRadius: 2, // Немного скругленные углы, но все еще квадратные
                        overflow: 'hidden',
                        border: 3,
                        borderColor: index === activeIndex
                            ? theme.palette.primary.main
                            : 'transparent',
                        boxShadow: index === activeIndex
                            ? theme.shadows[12]
                            : theme.shadows[6],
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                        position: 'relative',
                        backgroundColor: bgColor.current,
                        '&:hover': {
                            borderColor: theme.palette.primary.light,
                        }
                    }}
                >
                    {specialist.avatar ? (
                        <Box
                            component="img"
                            src={specialist.avatar}
                            alt={specialist.businessName}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s',
                                '&:hover': {
                                    transform: 'scale(1.1)'
                                }
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: bgColor.current,
                                color: 'white',
                                fontSize: cardSize.current * 0.4,
                                fontWeight: 700,
                                textTransform: 'uppercase'
                            }}
                        >
                            {specialist.businessName?.charAt(0) || '?'}
                        </Box>
                    )}


                </Box>

                {/* Имя специалиста - появляется при наведении */}
                <motion.div
                    initial={{ opacity: 0, y: isInUpperHalf ? 10 : -10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    style={{
                        position: 'absolute',
                        [isInUpperHalf ? 'bottom' : 'top']: -35,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: 24,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        pointerEvents: 'none',
                        boxShadow: theme.shadows[4],
                        border: `1px solid ${theme.palette.primary.main}`,
                        zIndex: 30
                    }}
                >
                    {specialist.businessName || specialist.name}
                </motion.div>
            </Box>
        </motion.div>
    );
};

// Основной компонент облака специалистов
export const SpecialistsCloud = ({ specialists = [] }) => {
    const theme = useTheme();
    const downMd = useMediaQuery(theme.breakpoints.down('md'));
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const autoPlayRef = useRef(null);
    const containerRef = useRef(null);

    // Берем первые 6 специалистов или меньше
    const displaySpecialists = specialists.slice(0, 6);

    // Активный специалист (большая карточка)
    const activeSpecialist = displaySpecialists[activeIndex];

    // Остальные специалисты (маленькие карточки на орбите)
    const otherSpecialists = displaySpecialists.filter((_, index) => index !== activeIndex);

    // Радиус орбиты в зависимости от размера экрана
    const getOrbitRadius = () => {
        if (downSm) return 40;
        if (downMd) return 100;
        return 120;
    };

    // Функция для переключения на следующего специалиста
    const nextSpecialist = () => {
        setActiveIndex((prev) => (prev + 1) % displaySpecialists.length);
    };


    // Автоматическое переключение
    useEffect(() => {
        if (!isAutoPlay || displaySpecialists.length <= 1) return;

        autoPlayRef.current = setInterval(() => {
            nextSpecialist();
        }, 4000);

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isAutoPlay, displaySpecialists.length]);

    // Остановка автопереключения при взаимодействии
    const handleManualChange = (callback) => {
        setIsAutoPlay(false);
        callback();
        setTimeout(() => setIsAutoPlay(true), 8000);
    };

    // Обработчик клика по карточке
    const handleSpecialistClick = (specialistId) => {
        // Останавливаем автопереключение
        setIsAutoPlay(false);

        // Переходим на страницу специалиста
        router.push(paths.specialist.publicPage.replace(':profileId', specialistId));

        // Возобновляем автопереключение через 10 секунд после возврата
        setTimeout(() => setIsAutoPlay(true), 10000);
    };

    if (!displaySpecialists.length) {
        return null;
    }

    // Преобразуем активного специалиста для HorizontalPreviewCard
    const activePreviewData = mapSpecialistToPreviewData(activeSpecialist, theme);

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                height: { xs: 300, sm: 350, md: 450 },
                width: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >


            {/* Контейнер для орбитальных карточек */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Невидимая центральная точка для позиционирования */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 0,
                        height: 0
                    }}
                >
                    {/* Центральная большая карточка */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, scale: 0.8, y: 60 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 30 }}
                            transition={{ duration: 0.5 }}
                            onClick={() => handleSpecialistClick(activeSpecialist.id)}
                            style={{
                                cursor: 'pointer',
                                position: 'absolute',
                                left: '90%',
                                top: '90%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10,
                                width: downSm ? '280px' : downMd ? '320px' : '380px',
                            }}
                        >
                            <HorizontalPreviewCard
                                data={activePreviewData}
                                theme={theme}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Летающие карточки на орбите */}
                    {otherSpecialists.map((specialist, index) => (
                        <OrbitalAvatarCard
                            key={specialist.id}
                            specialist={specialist}
                            index={index}
                            total={otherSpecialists.length}
                            activeIndex={activeIndex}
                            orbitRadius={getOrbitRadius()}
                            onClick={() => handleManualChange(() => {
                                const newIndex = displaySpecialists.findIndex(s => s.id === specialist.id);
                                setActiveIndex(newIndex);
                            })}
                            theme={theme}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

SpecialistsCloud.propTypes = {
    specialists: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        businessName: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string,
        rating: PropTypes.number,
    }))
};

SpecialistsCloud.defaultProps = {
    specialists: []
};

export default SpecialistsCloud;