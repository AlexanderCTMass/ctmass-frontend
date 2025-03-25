import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Button,
    CircularProgress,
    ImageList,
    Autocomplete
} from '@mui/material';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {PhotosDropzone} from "src/components/photos-dropzone";
import {PreviewEditable} from "src/components/myfancy/image-preview-editable";
import {toast} from 'react-hot-toast';
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import {useEffect, useState} from "react";
import {INFO} from "src/libs/log";
import * as React from "react";
import {v4 as uuidv4} from "uuid";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import Fancybox from "src/components/myfancy/myfancybox";

// Стандартные типы сертификатов для рабочих специальностей в США
const STANDARD_CERTIFICATE_TYPES = [
    'OSHA 10-Hour Construction',
    'OSHA 30-Hour Construction',
    'NCCER Core Certification',
    'EPA 608 Certification',
    'AWS Certified Welder',
    'State Electrician License',
    'Journeyman Plumber License',
    'HVAC Technician Certification',
    'CDL Class A',
    'First Aid/CPR Certified'
];

const validationSchema = Yup.object().shape({
    certificateType: Yup.string()
        .required('Certificate type is required')
        .test(
            'not-empty',
            'Certificate type is required',
            value => !!value && value.trim().length > 0
        ),
    issuingOrganization: Yup.string().required('Issuing organization is required'),
    year: Yup.number()
        .required('Year is required')
        .min(1900, 'Year must be after 1900')
        .max(new Date().getFullYear(), `Year can't be in the future`),
    description: Yup.string(),
    certificates: Yup.array()
});

// Списки образовательных учреждений США
const US_COMMUNITY_COLLEGES = [
    'Santa Monica College (CA)',
    'Pasadena City College (CA)',
    'De Anza College (CA)',
    'Houston Community College (TX)',
    'Lone Star College (TX)',
    'Miami Dade College (FL)',
    'Broward College (FL)',
    'Northern Virginia Community College (VA)',
    'Austin Community College (TX)',
    'City College of San Francisco (CA)'
];

const US_TRADE_SCHOOLS = [
    'Lincoln Tech',
    'UTI (Universal Technical Institute)',
    'Penn Foster Career School',
    'Ashworth College',
    'Porter and Chester Institute',
    'TESST College of Technology',
    'New England Institute of Technology',
    'WyoTech',
    'Empire Beauty School',
    'Aveda Institute'
];

const US_CERTIFYING_ORGANIZATIONS = [
    'National Center for Construction Education & Research (NCCER)',
    'Occupational Safety and Health Administration (OSHA)',
    'Environmental Protection Agency (EPA)',
    'American Welding Society (AWS)',
    'National Automotive Technicians Education Foundation (NATEF)',
    'Associated Builders and Contractors (ABC)',
    'Independent Electrical Contractors (IEC)',
    'National Association of Home Builders (NAHB)',
    'Plumbing-Heating-Cooling Contractors Association (PHCC)',
    'HVAC Excellence'
];

// Объединенный список всех организаций
const ALL_ISSUING_ORGANIZATIONS = [
    ...US_COMMUNITY_COLLEGES,
    ...US_TRADE_SCHOOLS,
    ...US_CERTIFYING_ORGANIZATIONS
];

export const EducationFormDialog = ({
    open,
    onClose,
    initialData = null,
    profileId,
    onSubmit
}) => {
    const [inputValue, setInputValue] = useState('');

    const formik = useFormik({
        initialValues: {
            certificateType: initialData?.certificateType || '',
            issuingOrganization: initialData?.issuingOrganization || '',
            year: initialData?.year || '',
            description: initialData?.description || '',
            certificates: initialData?.certificates?.map(url => ({url: url.url, preview: url.url})) || []
        },
        validationSchema,
        onSubmit: async (values, {setSubmitting}) => {
            try {
                const educationData = {
                    certificateType: values.certificateType,
                    issuingOrganization: values.issuingOrganization,
                    year: values.year,
                    description: values.description,
                    certificates: values.certificates.map(cert => ({
                        id: uuidv4(),
                        name: cert.file?.name || uuidv4(),
                        tags: [],
                        uploadedAt: new Date().toISOString().split('T')[0],
                        url: cert.preview,
                    }))
                };

                if (initialData?.id) {
                    await extendedProfileApi.updateEducation(
                        profileId,
                        initialData.id,
                        educationData,
                        initialData
                    );
                    onSubmit({id: initialData.id, ...educationData});
                    toast.success('Education updated successfully');
                } else {
                    const newVar = await extendedProfileApi.addEducation(
                        profileId,
                        educationData
                    );
                    onSubmit(newVar);
                    toast.success('Education added successfully');
                }
                onClose(true);
            } catch (error) {
                toast.error('Error saving education: ' + error.message);
            } finally {
                setSubmitting(false);
            }
        },
        enableReinitialize: true
    });

    const handleCertificateChange = (event, newValue) => {
        // Сохраняем любое значение, включая null (когда поле очищается)
        formik.setFieldValue('certificateType', newValue || '');
        setInputValue(newValue || '');
    };

    const handleInputChange = (event, newInputValue) => {
        setInputValue(newInputValue);
        // Обновляем значение формы только если это не выбор из списка
        if (!STANDARD_CERTIFICATE_TYPES.includes(newInputValue)) {
            formik.setFieldValue('certificateType', newInputValue);
        }
    };

    const handleRemoveImage = (index) => {
        const newCertificates = [...formik.values.certificates];
        newCertificates.splice(index, 1);
        formik.setFieldValue('certificates', newCertificates);
    };

    const handleRemovePhotos = (preview) => {
        formik.setFieldValue('certificates', formik.values.certificates.filter((item) => item.preview !== preview));
    };

    const handleFilesRemoveAll = () => {
        formik.setFieldValue('certificates', []);
    };

    const handleFilesDrop = (files) => {
        INFO("files", files);
        formik.setFieldValue('certificates', [
            ...formik.values.certificates,
            ...files.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                type: file.type.startsWith('video') ? 'video' : 'image',
            }))
        ]);
    };

    return (
        <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="md">
            <DialogTitle>
                {initialData ? 'Edit Education' : 'Add New Education'}
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Stack spacing={3} sx={{mt: 2}}>
                        <Autocomplete
                            freeSolo
                            options={STANDARD_CERTIFICATE_TYPES}
                            value={formik.values.certificateType}
                            inputValue={inputValue}
                            onChange={handleCertificateChange}
                            onInputChange={handleInputChange}
                            onBlur={formik.handleBlur}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Certificate Type"
                                    name="certificateType"
                                    required
                                    error={formik.touched.certificateType && Boolean(formik.errors.certificateType)}
                                    helperText={formik.touched.certificateType && formik.errors.certificateType}
                                />
                            )}
                        />

                        <Autocomplete
                            freeSolo
                            options={ALL_ISSUING_ORGANIZATIONS}
                            value={formik.values.issuingOrganization}
                            onChange={(event, newValue) => {
                                formik.setFieldValue('issuingOrganization', newValue || '');
                            }}
                            onInputChange={(event, newInputValue) => {
                                formik.setFieldValue('issuingOrganization', newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Issuing Organization"
                                    required
                                    error={formik.touched.issuingOrganization && Boolean(formik.errors.issuingOrganization)}
                                    helperText={formik.touched.issuingOrganization && formik.errors.issuingOrganization}
                                />
                            )}
                            groupBy={(option) => {
                                if (US_COMMUNITY_COLLEGES.includes(option)) return 'Community Colleges';
                                if (US_TRADE_SCHOOLS.includes(option)) return 'Trade Schools';
                                return 'Certifying Organizations';
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Year"
                            name="year"
                            type="number"
                            value={formik.values.year}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.year && Boolean(formik.errors.year)}
                            helperText={formik.touched.year && formik.errors.year}
                            inputProps={{min: 1900, max: new Date().getFullYear()}}
                            required
                        />

                        <PhotosDropzone
                            accept={{'image/*,.pdf': []}}
                            caption={"Attach photos or videos"}
                            maxFiles={3}
                            onDrop={handleFilesDrop}
                            onRemove={handleRemovePhotos}
                            onRemoveAll={handleFilesRemoveAll}
                            onUpload={() => {}}
                        />

                        {formik.values.certificates.length > 0 && (
                            <Fancybox
                                options={{
                                    Carousel: {
                                        infinite: false,
                                    },
                                }}
                            >
                                <ImageList cols={3} rowHeight={164}>
                                    {formik.values.certificates.map((cert, index) => (
                                        <a data-fancybox="gallery" href={cert.preview} className={"my-fancy-link"}>
                                            <PreviewEditable
                                                key={index}
                                                attach={{preview: cert.preview}}
                                                onRemove={() => handleRemoveImage(index)}
                                            />
                                        </a>
                                    ))}
                                </ImageList>
                            </Fancybox>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="button"
                        onClick={() => onClose(false)}
                        disabled={formik.isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? <CircularProgress size={24}/> : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

EducationFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    profileId: PropTypes.string.isRequired
};