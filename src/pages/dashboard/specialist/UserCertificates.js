import React, { useState } from "react";
import {Box, Dialog, DialogContent, Typography, Button, IconButton} from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import CloseIcon from "@mui/icons-material/Close";

const UserCertificates = ({ certificates }) => {
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    const openCertificateModal = (certificate) => {
        setSelectedCertificate(certificate);
    };

    const closeCertificateModal = () => {
        setSelectedCertificate(null);
    };

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3,  // 3 сертификата на экране
            slidesToSlide: 1,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
            slidesToSlide: 1,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
            slidesToSlide: 1,
        },
    };

    return (
        <Box>
            <Box sx={{ marginBottom: 4, backgroundColor: "white", borderRadius: 2 }}>
                <Typography variant="h6" sx={{ marginBottom: 0, paddingLeft: 2, paddingTop: 2 }}>
                    Certificates
                </Typography>

                <Box sx={{ marginTop: 2, paddingLeft: 2, paddingRight: 2, paddingBottom: 2}}>
                    <Carousel
                        responsive={responsive}
                        infinite={true}
                        keyBoardControl
                        containerClass="carousel-container"
                        removeArrowOnDeviceType={[]}
                        dotListClass="custom-dot-list-style"
                        sx={{
                            display: "flex",               // Гибкое поведение контейнера
                            justifyContent: "center",     // Центрируем элементы по горизонтали
                            alignItems: "center",         // Центрируем по вертикали
                        }}
                    >
                        {certificates.map((cert) => (
                            <Box
                                key={cert.name}
                                component="img"
                                src={cert.image}
                                alt={cert.name}
                                onClick={() => openCertificateModal(cert)}
                                sx={{
                                    width: "200px",
                                    height: "20vh",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    borderRadius: "4px",
                                    margin: "0 auto", // Центрируем изображение внутри
                                    display: "flex",   // Flex для изображения
                                    alignItems: "center", // Центрируем изображение по вертикали
                                    justifyContent: "center", // Центрируем по горизонтали
                                }}
                            />
                        ))}
                    </Carousel>
                </Box>
            </Box>

            {/* Диалоговое окно для просмотра сертификата */}
            <Dialog open={!!selectedCertificate} onClose={closeCertificateModal} maxWidth="sm" fullWidth>
                {selectedCertificate && (
                    <DialogContent sx={{ position: 'relative', padding: 2 }}>
                        {/* Крестик в правом верхнем углу */}
                        <IconButton
                            onClick={closeCertificateModal}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: 'gray',
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        {/* Название сертификата */}
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>
                            {selectedCertificate.name}
                        </Typography>

                        {/* Изображение сертификата с прокруткой */}
                        <Box
                            component="img"
                            src={selectedCertificate.image}
                            alt={selectedCertificate.name}
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '100vh', // Максимальная высота для изображения
                                objectFit: 'contain', // Чтобы изображение сохранило пропорции
                                overflowY: 'auto',
                            }}
                        />
                    </DialogContent>
                )}
            </Dialog>
        </Box>
    );
};

export default UserCertificates;
