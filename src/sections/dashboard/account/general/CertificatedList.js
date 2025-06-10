import React, {useEffect, useRef, useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import CertificateAddForm from "./CertificateAddForm";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { firestore, storage } from "../../../../libs/firebase";
import toast from "react-hot-toast";
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const CertificateList = (userSpecialty) => {
    const [certificates, setCertificates] = useState([]);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const userId = userSpecialty.userSpecialty.user;
    const specId = userSpecialty.userSpecialty.specialty;
    const [loading, setLoading] = useState(true);

    // Открытие и закрытие диалога
    const openDialog = (certificate = null) => {
        setSelectedCertificate(certificate);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setSelectedCertificate(null);
        setIsDialogOpen(false);
        setUploadProgress(0);
    };

    // Загрузка изображений в Firebase Storage
    const uploadCertificateImages = async (images) => {
        const uploadedImageUrls = [];
        for (const image of images) {
            try {
                // Если это blob-объект
                if (image.startsWith("blob:http")) {
                    const file = await fetch(image)
                        .then((res) => res.blob())
                        .catch((err) => {
                            console.error("Error fetching image:", err.message);
                            throw err;
                        });

                    const fileName = `${Date.now()}-${uuidv4()}`;
                    const storageRef = ref(storage, `/certificates/${userId}/${fileName}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    // Обработка состояния загрузки
                    uploadTask.on("state_changed", (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setUploadProgress(progress);
                    });

                    // Ожидаем завершения загрузки
                    await uploadTask;

                    // Получаем URL загруженного файла
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    uploadedImageUrls.push(downloadURL);
                } else {
                    // Если это уже загруженное изображение (ссылка на Firebase)
                    uploadedImageUrls.push(image);
                }
            } catch (error) {
                console.error("Error uploading file:", error.message);
            }
        }
        return uploadedImageUrls;
    };


    // Сохранение сертификата в Firestore
    const saveCertificateToFirestore = async (form, imageUrls) => {
        const id = `${userId}:${specId}`;
        const userDocRef = doc(firestore, "userSpecialties", id);

        const newCertificate = {
            title: form.title || "",
            series: form.series || "",
            number: form.number || "",
            place: form.place || "",
            additional: form.additional || "",
            date: form.date || null,
            images: imageUrls || [],
            id: uuidv4(),
        };

        await setDoc(
            userDocRef,
            { certificates: arrayUnion(newCertificate) },
            { merge: true }
        );

        setCertificates((prev) => [...prev, newCertificate]);
        toast.success("Certificate saved successfully!");
    };

    // Удаление сертификата из Firestore
    const deleteCertificateFromFirestore = async (certificate) => {
        const id = `${userId}:${specId}`;
        const userDocRef = doc(firestore, "userSpecialties", id);
        await updateDoc(userDocRef, {
            certificates: arrayRemove(certificate),
        });
    };

    // Удаление изображений из Firebase Storage
    const deleteImagesFromStorage = async (imageUrls) => {
        for (const url of imageUrls) {
            // Убедитесь, что передаем правильный URL в decodeURIComponent
            const decodedUrl = decodeURIComponent(url);

            try {
                // Преобразуем в путь и используем в референсе для удаления
                const path = decodedUrl.match(/firebasestorage.googleapis.com\/v0\/b\/[^\/]+\/o\/(.+?)\?/)[1];
                const imageRef = ref(storage, path);

                // Удаляем изображение
                await deleteObject(imageRef);
            } catch (error) {
                console.error("Error deleting image:", error);
            }
        }
        toast.success("Images deleted successfully.");
    };

    // Удаление сертификата
    const deleteCertificate = async (cert) => {
        try {
            await deleteImagesFromStorage(cert.images);
            await deleteCertificateFromFirestore(cert);
            setCertificates((prev) => prev.filter((c) => c.id !== cert.id));
            toast.success("Certificate deleted successfully.");
        } catch (error) {
            console.error("Error deleting certificate: ", error);
            toast.error("Failed to delete certificate.");
        }
    };

    const getFilePathFromUrl = (url) => {
        // Разбираем URL и извлекаем путь к файлу (первое, что идет после "o/")
        const match = url.match(/firebasestorage.googleapis.com\/v0\/b\/[^\/]+\/o\/(.+?)\?/);
        return match ? decodeURIComponent(match[1]) : null; // Декодируем URL и извлекаем путь
    };

    const updateCertificateInFirestore = async (form, newImages = []) => {
        const id = `${userId}:${specId}`;
        const userDocRef = doc(firestore, "userSpecialties", id);

        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();
        const certificates = userData.certificates || [];

        // Найти существующий сертификат для обновления
        const existingCertificate = certificates.find((cert) => cert.id === form.id);

        if (!existingCertificate) {
            throw new Error("Certificate not found");
        }

        // Фильтруем старые изображения, чтобы получить только те, которые были удалены
        const existingPaths = existingCertificate.images.map(getFilePathFromUrl);  // Старые пути
        const newPaths = newImages.map(getFilePathFromUrl); // Новые пути

        // Сравниваем старые пути с новыми и находим те, которых нет в новых путях
        const removedImages = existingPaths.filter(path => !newPaths.includes(path));

        // Удаляем старые изображения из Firebase Storage
        if (removedImages.length > 0) {
            await deleteImagesFromStorage(removedImages);
        }

        // Обновляем сертификат с новыми изображениями
        const updatedCertificate = {
            ...existingCertificate,
            ...form,
            images: newImages,
        };

        // Обновляем массив сертификатов
        const updatedCertificates = certificates.map((cert) =>
            cert.id === form.id ? updatedCertificate : cert
        );

        // Сохраняем обновленные сертификаты в Firestore
        await updateDoc(userDocRef, {
            certificates: updatedCertificates,
        });

        setCertificates(updatedCertificates);
        toast.success("Certificate updated successfully!");
    };

    const handleSaveCertificate = async (form) => {
        try {
            const images = form.images
            if (form.id) {
                const imageUrls = images.length > 0 ? await uploadCertificateImages(images) : [];
                await updateCertificateInFirestore(form, imageUrls);
            } else {
                const imageUrls = images.length > 0 ? await uploadCertificateImages(images) : [];
                await saveCertificateToFirestore(form, imageUrls);
            }
            closeDialog();
        } catch (error) {
            console.error("Error saving certificate: ", error);
            toast.error("Failed to save certificate.");
        }
    };

    // Получение сертификатов из Firestore
    const fetchCertificates = async () => {
        try {
            const userDocRef = doc(firestore, "userSpecialties", `${userId}:${specId}`);
            const userDocSnapshot = await getDoc(userDocRef);

            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                const fetchedCertificates = userData.certificates || [];
                const updatedCertificates = fetchedCertificates.map((cert) => ({
                    ...cert,
                    date: cert.date ? new Date(cert.date.toDate()) : null,
                }));
                setCertificates(updatedCertificates);
            } else {
                setCertificates([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching certificates: ", error);
            toast.error("Failed to fetch certificates.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, [specId, userId]);

    const progressRef = useRef(null);

    useEffect(() => {
        if (uploadProgress > 0 && progressRef.current) {
            progressRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [uploadProgress]);

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Certificates
            </Typography>
            {loading && <LinearProgress sx={{ mb: 2 }} />}

            <Paper sx={{ p: 2 }}>
                <List>
                    {certificates.length === 0 && !loading && (
                        <Typography variant="body2" align="center">
                            No certificates added yet.
                        </Typography>
                    )}
                    {certificates.map((cert) => (
                        <ListItem key={cert.id} button onClick={() => openDialog(cert)}>
                            <ListItemText
                                primary={cert.title || ""}
                                secondary={`${cert.series || "No Series"} - ${cert.number || "No Number"}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton onClick={() => openDialog(cert)}>
                                    <Edit />
                                </IconButton>
                                <IconButton onClick={() => deleteCertificate(cert)}>
                                    <Delete />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
                <Button
                    startIcon={<Add />}
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => openDialog()}
                >
                    Add Certificate
                </Button>
            </Paper>

            <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    {selectedCertificate ? "Edit Certificate" : "Add Certificate"}
                </DialogTitle>
                <DialogContent>
                    <CertificateAddForm
                        initialData={selectedCertificate || {}}
                        onSave={handleSaveCertificate}
                    />
                    {uploadProgress > 0 && (
                        <Box sx={{ mt: 2 }} ref={progressRef}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                Upload progress: {uploadProgress}%
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CertificateList;
