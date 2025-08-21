import React, { useState } from "react";
import { ProfileSpecialtiesView } from "./servicesAndPrices/profileSpecialtiesView";
import { ProfileSpecialtiesHeader } from "./servicesAndPrices/ProfileSpecialtiesHeader";
import { ProfileSpecialtiesEditModalView } from "./servicesAndPrices/ProfileSpecialtiesEditModalView";
import { ImageModalView } from "./servicesAndPrices/ImageModalView";

export default function ServiceAndPrices({ profile, setProfile, allSpecialties, allServices, isMyProfile }) {
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
    const [editServiceIndex, setEditServiceIndex] = useState(null);
    const [currentService, setCurrentService] = useState({
        specialty: null,
        services: []
    });

    const [loadingForm, setLoadingForm] = useState(true);

    const [expandedServiceIndex, setExpandedServiceIndex] = useState(0);


    const handleOpen = (imageIndex, images) => {
        setImages(images);
        setCurrentIndex(imageIndex);
        setImageModalOpen(true);
    };

    const openAddServiceDialog = () => {
        setCurrentService({ specialty: null, services: [] });
        setAddServiceDialogOpen(true);
        setEditServiceIndex(null);
        setExpandedServiceIndex(0); // Сбрасываем индекс раскрытого аккордиона
    };

    const openEditServiceDialog = (index, event) => {
        event.stopPropagation()
        setCurrentService(profile.specialties[index]);
        setAddServiceDialogOpen(true);
        setEditServiceIndex(index);
        setExpandedServiceIndex(0);
    };

    return (
        <div>
            <ProfileSpecialtiesHeader isMyProfile={isMyProfile}
                openAddServiceDialog={openAddServiceDialog} />
            <ProfileSpecialtiesView profile={profile}
                setProfile={setProfile}
                allSpecialties={allSpecialties}
                allServices={allServices}
                handleOpen={handleOpen}
                openEditServiceDialog={openEditServiceDialog}
                expandedServiceIndex={expandedServiceIndex}
                setExpandedServiceIndex={setExpandedServiceIndex}
                isMyProfile={isMyProfile}

            />
            <ImageModalView
                open={imageModalOpen}
                setImageModalOpen={setImageModalOpen}
                images={images}
                setImages={setImages}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
            />

            <ProfileSpecialtiesEditModalView
                profile={profile}
                setProfile={setProfile}
                allSpecialties={allSpecialties}
                allServices={allServices}
                currentService={currentService}
                addServiceDialogOpen={addServiceDialogOpen}
                setAddServiceDialogOpen={setAddServiceDialogOpen}
                editServiceIndex={editServiceIndex}
                expandedServiceIndex={expandedServiceIndex}
                setExpandedServiceIndex={setExpandedServiceIndex}
                loading={loadingForm}
            />
        </div>
    );
}