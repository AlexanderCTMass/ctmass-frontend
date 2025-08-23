import React, { useEffect, useState } from "react";
import { collection, endAt, getDocs, orderBy, query, startAt } from "firebase/firestore";
import { firestore } from "../../../../libs/firebase";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    ImageListItem,
    ListSubheader,
    Typography
} from "@mui/material";
import { ArrowBack, ArrowForward } from '@mui/icons-material'; // Иконки для кнопок

const CertificatesCarousel = ({ userId }) => {
    const [certificatesBySpecialty, setCertificatesBySpecialty] = useState({});
    const [specialtyLabels, setSpecialtyLabels] = useState({}); // Маппинг specialtyId -> label
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [certificateList, setCertificateList] = useState([]); // Список сертификатов для переключения
    const [currentIndex, setCurrentIndex] = useState(0); // Индекс текущего сертификата

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const userSpecialtiesRef = collection(firestore, "userSpecialties");

                const q = query(
                    userSpecialtiesRef,
                    orderBy("__name__"),
                    startAt(userId),
                    endAt(userId + "\uf8ff")
                );

                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.warn("No certificates found for user.");
                    return;
                }

                // Группировка сертификатов по специальности
                const groupedCertificates = {};
                const certificatesArray = [];

                querySnapshot.docs.forEach((doc) => {
                    const data = doc.data();
                    const specialty = data.specialty || "Unknown Specialty";

                    if (!groupedCertificates[specialty]) {
                        groupedCertificates[specialty] = [];
                    }

                    (data.certificates || []).forEach((cert) => {
                        const certificate = {
                            img: cert.images || "", // Первое изображение
                            title: cert.title || "No title",
                            subtitle: cert.additional || "",
                            specialty,
                            ...cert // Добавляем все данные сертификата
                        };
                        groupedCertificates[specialty].push(certificate);
                        certificatesArray.push(certificate); // Добавляем в общий список для переключения
                    });
                });

                setCertificatesBySpecialty(groupedCertificates);
                setCertificateList(certificatesArray); // Заполняем общий список
            } catch (error) {
                console.error("Error fetching certificates:", error);
            }
        };

        const fetchSpecialtyLabels = async () => {
            try {
                const specialtiesCategoriesRef = collection(firestore, "specialtiesCategories");
                const categoriesSnapshot = await getDocs(specialtiesCategoriesRef);

                const labelsMap = {};

                // Проход по всем категориям и их вложенным коллекциям specialties
                for (const categoryDoc of categoriesSnapshot.docs) {
                    const specialtiesRef = collection(firestore, `specialtiesCategories/${categoryDoc.id}/specialties`);
                    const specialtiesSnapshot = await getDocs(specialtiesRef);

                    specialtiesSnapshot.docs.forEach((specialtyDoc) => {
                        labelsMap[specialtyDoc.id] = specialtyDoc.data().label; // Сохраняем label для specialtyId
                    });
                }

                setSpecialtyLabels(labelsMap);
            } catch (error) {
                console.error("Error fetching specialties labels:", error);
            }
        };

        fetchCertificates();
        fetchSpecialtyLabels();
    }, [userId]);

    const handleImageClick = (certificate) => {
        setSelectedCertificate(certificate);
        setCurrentIndex(certificateList.indexOf(certificate)); // Устанавливаем текущий индекс сертификата
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Преобразование Timestamp в читаемый формат даты
    const formatDate = (timestamp) => {
        if (!timestamp) return "Unknown Date";
        const date = timestamp.toDate();
        return date.toLocaleDateString(); // Можно настроить формат по вашему усмотрению
    };

    const handleNextCertificate = () => {
        if (currentIndex < certificateList.length - 1) {
            setSelectedCertificate(certificateList[currentIndex + 1]);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevCertificate = () => {
        if (currentIndex > 0) {
            setSelectedCertificate(certificateList[currentIndex - 1]);
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Функция для отображения данных только если они есть
    const renderIfNotEmpty = (value) => {
        if (value && value !== "Unknown Date") {
            return <Typography>{value}</Typography>;
        }
        return null; // Не отображаем ничего, если данных нет
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column", // Блоки идут сверху вниз
                    gap: 3, // Отступ между блоками
                    width: "100%", // Растягиваем на всю ширину
                    padding: 0, // Внешние отступы
                }}
            >
                {Object.entries(certificatesBySpecialty).map(([specialty, certificates]) => (
                    <Box
                        key={specialty}
                        sx={{
                            backgroundColor: "white",
                            marginBottom: 2,
                            borderRadius: "15px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            padding: 2,
                            width: "50vw", // Ограничиваем ширину
                            margin: "0 auto", // Центрируем по горизонтали
                        }}
                    >
                        {/* Заголовок */}
                        <ImageListItem key="Subheader" cols={2}>
                            <ListSubheader
                                component="div"
                                sx={{
                                    backgroundColor: "transparent",
                                    color: "black",
                                    fontSize: "1.2rem",
                                    fontWeight: "bold",
                                    marginBottom: 2,
                                    marginTop: 0,
                                    padding: 0,
                                }}
                            >
                                {specialtyLabels[specialty] || "Unknown Specialty"}
                            </ListSubheader>
                        </ImageListItem>

                        {/* Сертификаты для данной специальности */}
                        {certificates.length > 0 ? (
                            certificates.map((item, index) => (
                                <React.Fragment key={item.id || index}>
                                    {item.images && item.images.length > 0 ? (
                                        item.images.map((image, imgIndex) => (
                                            <ImageListItem
                                                key={`${item.id || index}-${imgIndex}`}
                                                sx={{
                                                    backgroundColor: "white",
                                                    margin: "8px 0",
                                                    borderRadius: "10px",
                                                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                                    maxWidth: "50vw",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    height: "300px",
                                                    overflow: "hidden", // Скрываем лишние части изображения
                                                }}
                                            >
                                                <img
                                                    src={image}
                                                    alt={item.title || `Certificate ${index}`}
                                                    loading="lazy"
                                                    onClick={() => handleImageClick(item)}
                                                    style={{
                                                        objectFit: "contain",
                                                        display: "block",
                                                        margin: "auto",
                                                        maxWidth: "100%",
                                                        maxHeight: "100%",
                                                    }}
                                                />
                                            </ImageListItem>
                                        ))
                                    ) : (
                                        <Typography>
                                            No certificates images
                                        </Typography>
                                    )}
                                </React.Fragment>
                            ))) : (
                            <Typography>
                                No certificates available.
                            </Typography>
                        )}
                    </Box>
                ))}
                <Box />
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ marginBottom: 0 }}>
                    {selectedCertificate?.title || "Certificate Details"}
                </DialogTitle>
                <DialogContent sx={{ pt: 0, pb: 2 }}>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Box sx={{
                            position: "relative",
                            width: "100%",
                            height: "auto",
                            display: "flex",
                            justifyContent: "center"
                        }}>
                            {/* Картинка сертификата */}
                            <img
                                src={`${selectedCertificate?.img}?w=800&h=800&fit=crop&auto=format`} // Увеличили изображение
                                alt={selectedCertificate?.title}
                                style={{
                                    width: "100%",
                                    maxWidth: "600px", // Ограничим максимальный размер изображения
                                    height: "auto",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    objectFit: "contain" // Центрируем изображение
                                }}
                            />

                            {/* Кнопки для переключения сертификатов */}
                            <IconButton
                                onClick={handlePrevCertificate}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "10px",
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0,0,0,0.5)",
                                    color: "white",
                                    borderRadius: "50%",
                                    padding: "10px",
                                    '&:hover': { backgroundColor: "rgba(0,0,0,0.7)" }
                                }}
                                disabled={currentIndex === 0}
                            >
                                <ArrowBack />
                            </IconButton>

                            <IconButton
                                onClick={handleNextCertificate}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    right: "10px",
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0,0,0,0.5)",
                                    color: "white",
                                    borderRadius: "50%",
                                    padding: "10px",
                                    '&:hover': { backgroundColor: "rgba(0,0,0,0.7)" }
                                }}
                                disabled={currentIndex === certificateList.length - 1}
                            >
                                <ArrowForward />
                            </IconButton>
                        </Box>

                        {/* Данные сертификата */}
                        <Box sx={{ marginTop: 2, width: "100%", textAlign: "left" }}>
                            <p><strong>Specialty:</strong> {specialtyLabels[selectedCertificate?.specialty]}</p>
                            {renderIfNotEmpty(selectedCertificate?.additional) &&
                                <p><strong>Additional Info:</strong> {selectedCertificate?.additional}</p>}
                            {renderIfNotEmpty(selectedCertificate?.number) &&
                                <p><strong>Certificate Number:</strong> {selectedCertificate?.number}</p>}
                            {renderIfNotEmpty(selectedCertificate?.place) &&
                                <p><strong>Place:</strong> {selectedCertificate?.place}</p>}
                            {renderIfNotEmpty(selectedCertificate?.series) &&
                                <p><strong>Series:</strong> {selectedCertificate?.series}</p>}
                            {renderIfNotEmpty(formatDate(selectedCertificate?.date)) &&
                                <p><strong>Issued on:</strong> {formatDate(selectedCertificate?.date)}</p>}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default CertificatesCarousel;
