import { Typography } from "@mui/material";
import { SpecialtyView } from "./specialtyView";
import React from "react";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";

export const ProfileSpecialtiesView = ({
    profile,
    setProfile,
    allSpecialties,
    allServices,
    handleOpen,
    openEditServiceDialog,
    expandedServiceIndex,
    setExpandedServiceIndex,
    isMyProfile
}) => {

    const deleteService = (index, event) => {
        event.stopPropagation();
        const sp = profile.specialties.filter((_, i) => i !== index);
        setProfile(prev => ({
            ...prev,
            specialties: sp,
            mainSpecId: prev.mainSpecId === profile.specialties[index].specialty ? null : prev.mainSpecId
        }));

        extendedProfileApi.deleteSpecialties(profile.profile.id, profile.specialties[index].specialty)
        if (expandedServiceIndex === index) {
            setExpandedServiceIndex(null);
        }
    };

    return (
        <>
            {(!profile.specialties || profile.specialties.length === 0) &&
                <Typography color="text.secondary" fontSize="14px">there is no completed service information</Typography>}
            {profile.specialties?.map((service, serviceIndex) => {
                const specialty = allSpecialties?.find(s => s.id === service.specialty);
                return (
                    <SpecialtyView
                        key={`${service.specialty}-${serviceIndex}`}
                        profile={profile}
                        setProfile={setProfile}
                        specialty={specialty}
                        allServices={allServices}
                        serviceIndex={serviceIndex}
                        service={service}
                        handleOpen={handleOpen}
                        deleteService={deleteService}
                        openEditServiceDialog={openEditServiceDialog}
                        isMyProfile={isMyProfile}
                    />
                );
            })}
        </>
    )
}