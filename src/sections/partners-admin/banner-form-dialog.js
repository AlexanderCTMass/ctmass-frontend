import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    Divider,
    FormControlLabel,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { partnerAdsApi } from 'src/api/partner-ads';
import { AD_LAYOUTS, AD_PLACEMENTS } from 'src/constants/partner-ads';
import { BannerPreview } from './banner-preview';
import { CreativeDropzone } from './creative-dropzone';
import {
    AD_TIME_ZONE_LABEL,
    addDaysInput,
    endOfDateInput,
    lastDayInput,
    startOfDateInput,
    toDateInput
} from './date-utils';
import { inputSx, outlinedButtonSx, pa, primaryButtonSx, sectionLabelSx } from './tokens';

const DURATIONS = [7, 14, 30, 90];

const schema = Yup.object({
    title: Yup.string().trim().max(40, 'Keep the headline under 40 characters').required('Add a headline'),
    subtitle: Yup.string().trim().max(60, 'Keep the subtitle under 60 characters'),
    ctaLabel: Yup.string().trim().max(18, 'Keep the button label under 18 characters'),
    targetUrl: Yup.string()
        .trim()
        .matches(/^https:\/\/[^\s]+\.[^\s]+$/i, 'Use a full https:// link')
        .required('Add the link the banner opens'),
    partnerName: Yup.string().trim().max(80).required('Add the partner name'),
    partnerWebsite: Yup.string().trim().url('Use a full link, e.g. https://brand.com'),
    partnerEmail: Yup.string().trim().email('Enter a valid email'),
    layout: Yup.string().oneOf(AD_LAYOUTS.map((l) => l.value)).required(),
    placements: Yup.array().of(Yup.string()).min(1, 'Choose at least one placement'),
    priority: Yup.number().typeError('Use a number').min(0).max(100).required(),
    startDate: Yup.string().required('Pick a start date'),
    endDate: Yup.string()
        .required('Pick an end date')
        .test('after-start', 'The end date must be on or after the start date', function (value) {
            const { startDate } = this.parent;
            return !value || !startDate || value >= startDate;
        }),
    budgetUsd: Yup.number()
        .transform((value, original) => (original === '' || original === null ? null : value))
        .typeError('Use a number')
        .min(0)
        .nullable(),
    notes: Yup.string().max(1000),
    status: Yup.string().oneOf(['draft', 'active', 'paused'])
});

const initialValuesFor = (banner) => {
    const today = toDateInput(Date.now());
    return {
        title: banner?.title || '',
        subtitle: banner?.subtitle || '',
        ctaLabel: banner ? banner.ctaLabel : 'Learn more',
        targetUrl: banner?.targetUrl || '',
        partnerName: banner?.partnerName || '',
        partnerWebsite: banner?.partnerWebsite || '',
        partnerEmail: banner?.partnerEmail || '',
        layout: banner?.layout || 'split',
        placements: banner ? Object.keys(banner.placements || {}) : [],
        priority: banner?.priority ?? 0,
        startDate: banner?.startAt ? toDateInput(banner.startAt) : today,
        endDate: banner?.endAt ? lastDayInput(banner.endAt) : addDaysInput(today, 29),
        budgetUsd: banner?.budgetUsd ?? '',
        notes: banner?.notes || '',
        status: banner?.status && ['draft', 'active', 'paused'].includes(banner.status) ? banner.status : 'draft'
    };
};

const Field = ({ formik, name, label, ...props }) => (
    <TextField
        fullWidth
        size="small"
        name={name}
        label={label}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched[name] && formik.errors[name])}
        helperText={(formik.touched[name] && formik.errors[name]) || props.helperText}
        sx={inputSx}
        {...props}
    />
);

Field.propTypes = {
    formik: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    helperText: PropTypes.node
};

export const BannerFormDialog = ({ open, banner, onClose, user, existingIds }) => {
    const fullScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const isEdit = Boolean(banner);
    const [lightFile, setLightFile] = useState(null);
    const [lightPreview, setLightPreview] = useState('');
    const [darkFile, setDarkFile] = useState(null);
    const [darkPreview, setDarkPreview] = useState('');
    const [removeDark, setRemoveDark] = useState(false);
    const [imageError, setImageError] = useState('');
    const [previewMode, setPreviewMode] = useState('light');
    const statusOverride = useRef(null);

    const formik = useFormik({
        initialValues: initialValuesFor(banner),
        validationSchema: schema,
        onSubmit: async (values, helpers) => {
            if (!lightFile && !banner?.imageUrl) {
                setImageError('Upload the banner image');
                helpers.setSubmitting(false);
                return;
            }
            const status = statusOverride.current || values.status;
            try {
                const payload = {
                    title: values.title.trim(),
                    subtitle: values.subtitle.trim(),
                    ctaLabel: values.layout === 'image' ? '' : values.ctaLabel.trim(),
                    targetUrl: values.targetUrl.trim(),
                    partnerName: values.partnerName.trim(),
                    partnerWebsite: values.partnerWebsite.trim(),
                    partnerEmail: values.partnerEmail.trim(),
                    layout: values.layout,
                    placements: Object.fromEntries(values.placements.map((key) => [key, true])),
                    priority: Number(values.priority) || 0,
                    startAt: startOfDateInput(values.startDate),
                    endAt: endOfDateInput(values.endDate),
                    budgetUsd: values.budgetUsd === '' || values.budgetUsd === null ? null : Number(values.budgetUsd),
                    notes: values.notes.trim(),
                    status
                };
                await partnerAdsApi.saveBanner({
                    existing: banner,
                    values: payload,
                    lightFile,
                    darkFile,
                    removeDark,
                    user,
                    existingIds
                });
                toast.success(
                    isEdit
                        ? 'Banner updated'
                        : status === 'active'
                            ? 'Banner published'
                            : 'Banner saved as draft'
                );
                onClose();
            } catch (error) {
                toast.error(error?.message || 'Could not save the banner');
            } finally {
                helpers.setSubmitting(false);
            }
        }
    });

    useEffect(
        () => () => {
            if (lightPreview) URL.revokeObjectURL(lightPreview);
        },
        [lightPreview]
    );
    useEffect(
        () => () => {
            if (darkPreview) URL.revokeObjectURL(darkPreview);
        },
        [darkPreview]
    );

    const previewBanner = useMemo(
        () => ({
            ...formik.values,
            ctaLabel: formik.values.layout === 'image' ? '' : formik.values.ctaLabel,
            imageUrl: lightPreview || banner?.imageUrl || '',
            imageDarkUrl: removeDark ? '' : darkPreview || banner?.imageDarkUrl || ''
        }),
        [formik.values, lightPreview, darkPreview, removeDark, banner]
    );

    const togglePlacement = (key) => {
        const current = formik.values.placements;
        formik.setFieldValue(
            'placements',
            current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
        );
        formik.setFieldTouched('placements', true, false);
    };

    const submitWithStatus = (status) => {
        statusOverride.current = status;
        formik.submitForm();
    };

    const submitting = formik.isSubmitting;
    const selectedLayout = AD_LAYOUTS.find((item) => item.value === formik.values.layout);

    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
            fullScreen={fullScreen}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { borderRadius: fullScreen ? 0 : '20px', bgcolor: pa.surface } }}
        >
            <Stack direction="row" alignItems="flex-start" sx={{ px: { xs: 2.5, md: 4 }, pt: 3, pb: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: pa.text }}>
                        {isEdit ? `Edit banner ${banner.id}` : 'Create a new banner'}
                    </Typography>
                    <Typography sx={{ color: pa.textSecondary, fontSize: 14 }}>
                        {isEdit ? 'Changes go live in the app as soon as you save.' : 'Fill in the campaign details and upload the creative.'}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} disabled={submitting} aria-label="Close">
                    <CloseIcon />
                </IconButton>
            </Stack>
            <Divider sx={{ borderColor: pa.border }} />

            <Box
                component="form"
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    formik.handleSubmit();
                }}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.1fr) minmax(0, 1fr)' },
                    overflowY: 'auto'
                }}
            >
                <Stack spacing={2.25} sx={{ p: { xs: 2.5, md: 4 }, borderRight: { md: `1px solid ${pa.border}` } }}>
                    <Typography sx={sectionLabelSx}>Creative content</Typography>
                    <Field formik={formik} name="title" label="Headline" placeholder="e.g. Best service" />
                    <Field formik={formik} name="subtitle" label="Subtitle" placeholder="e.g. 50% off your first visit" />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Field
                            formik={formik}
                            name="ctaLabel"
                            label="Button label"
                            placeholder="Try now"
                            disabled={formik.values.layout === 'image'}
                            helperText="Leave empty to hide the button"
                        />
                        <Field formik={formik} name="layout" label="Layout" select>
                            {AD_LAYOUTS.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Field>
                    </Stack>
                    {selectedLayout ? (
                        <Typography sx={{ fontSize: 12.5, color: pa.textMuted, mt: '-8px !important' }}>
                            {selectedLayout.description}
                        </Typography>
                    ) : null}
                    <Field
                        formik={formik}
                        name="targetUrl"
                        label="Link (opens on tap)"
                        placeholder="https://partner.com/offer?utm_source=ctmass"
                    />

                    <Typography sx={{ ...sectionLabelSx, pt: 1 }}>Partner</Typography>
                    <Field formik={formik} name="partnerName" label="Partner name" placeholder="e.g. Western Mass Heating" />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Field formik={formik} name="partnerWebsite" label="Website (optional)" />
                        <Field formik={formik} name="partnerEmail" label="Contact email (optional)" />
                    </Stack>

                    <Typography sx={{ ...sectionLabelSx, pt: 1 }}>Placements</Typography>
                    <Stack spacing={0.5}>
                        {AD_PLACEMENTS.map((placement) => (
                            <FormControlLabel
                                key={placement.key}
                                sx={{ alignItems: 'flex-start', m: 0 }}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={formik.values.placements.includes(placement.key)}
                                        onChange={() => togglePlacement(placement.key)}
                                        sx={{ pt: 0.25, '&.Mui-checked': { color: pa.primary } }}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: pa.text }}>
                                            {placement.label}
                                            <Typography component="span" sx={{ fontSize: 12, color: pa.textMuted, ml: 1 }}>
                                                {placement.audience}
                                            </Typography>
                                        </Typography>
                                        <Typography sx={{ fontSize: 12.5, color: pa.textMuted }}>{placement.description}</Typography>
                                    </Box>
                                }
                            />
                        ))}
                        {formik.touched.placements && formik.errors.placements ? (
                            <Typography sx={{ fontSize: 12.5, color: pa.danger }}>{formik.errors.placements}</Typography>
                        ) : null}
                    </Stack>

                    <Typography sx={{ ...sectionLabelSx, pt: 1 }}>Budget & schedule</Typography>
                    <Typography sx={{ fontSize: 12.5, color: pa.textMuted, mt: '-8px !important' }}>
                        Dates start and end at midnight, {AD_TIME_ZONE_LABEL}.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Field formik={formik} name="startDate" label="Start date" type="date" InputLabelProps={{ shrink: true }} />
                        <Field
                            formik={formik}
                            name="endDate"
                            label="Last day shown"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: formik.values.startDate }}
                        />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {DURATIONS.map((days) => (
                            <Chip
                                key={days}
                                label={`${days} days`}
                                size="small"
                                onClick={() =>
                                    formik.setFieldValue('endDate', addDaysInput(formik.values.startDate || toDateInput(Date.now()), days - 1))
                                }
                                sx={{ bgcolor: pa.primarySoft, color: pa.primaryHover, fontWeight: 600 }}
                            />
                        ))}
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Field
                            formik={formik}
                            name="budgetUsd"
                            label="Total budget"
                            type="number"
                            placeholder="500"
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        />
                        <Field
                            formik={formik}
                            name="priority"
                            label="Priority (0–100)"
                            type="number"
                            helperText="Higher shows first"
                        />
                    </Stack>
                    {isEdit ? (
                        <Field formik={formik} name="status" label="Status" select>
                            <MenuItem value="draft">Draft (hidden)</MenuItem>
                            <MenuItem value="active">Active (shown during its dates)</MenuItem>
                            <MenuItem value="paused">Paused (hidden)</MenuItem>
                        </Field>
                    ) : null}
                    <Field
                        formik={formik}
                        name="notes"
                        label="Internal notes"
                        placeholder="Targeting details, contract terms, links…"
                        multiline
                        minRows={3}
                    />
                </Stack>

                <Stack spacing={2.5} sx={{ p: { xs: 2.5, md: 4 }, bgcolor: pa.surfaceMuted }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={sectionLabelSx}>Live preview</Typography>
                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={previewMode}
                            onChange={(_, value) => value && setPreviewMode(value)}
                            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 1.5, py: 0.25 } }}
                        >
                            <ToggleButton value="light">Light</ToggleButton>
                            <ToggleButton value="dark">Dark</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: pa.radius,
                            bgcolor: previewMode === 'dark' ? '#05070C' : '#EAF5EE',
                            transition: 'background-color 160ms ease'
                        }}
                    >
                        <BannerPreview banner={previewBanner} mode={previewMode} />
                    </Box>

                    <CreativeDropzone
                        title="Banner image"
                        hint="JPG, PNG or WEBP up to 5 MB. Recommended 1200×400px (3:1). For “Text + logo” a transparent PNG logo works best."
                        previewUrl={lightPreview || banner?.imageUrl || ''}
                        error={imageError}
                        onSelect={(file, url) => {
                            setLightFile(file);
                            setLightPreview(url);
                            setImageError('');
                            setPreviewMode('light');
                        }}
                    />
                    <CreativeDropzone
                        compact
                        title="Dark theme image (optional)"
                        hint="Used when the app is in dark mode. If empty, the main image is used."
                        previewUrl={removeDark ? '' : darkPreview || banner?.imageDarkUrl || ''}
                        onSelect={(file, url) => {
                            setDarkFile(file);
                            setDarkPreview(url);
                            setRemoveDark(false);
                            setPreviewMode('dark');
                        }}
                        onRemove={() => {
                            setDarkFile(null);
                            setDarkPreview('');
                            setRemoveDark(true);
                        }}
                    />

                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                            p: 2,
                            borderRadius: pa.radius,
                            bgcolor: pa.warningSoft,
                            border: `1px solid ${pa.warningBorder}`
                        }}
                    >
                        <InfoOutlinedIcon sx={{ color: pa.warningText, fontSize: 20, mt: '2px' }} />
                        <Box>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: pa.warningText }}>Before publishing</Typography>
                            <Typography sx={{ fontSize: 12.5, color: pa.warningText }}>
                                Every banner is labeled “Sponsored” in the app. Check that the creative and the landing page follow
                                App Store and Google Play ad rules: no misleading claims, no fake system UI, and nothing aimed at
                                children.
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Box>

            <Divider sx={{ borderColor: pa.border }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ px: { xs: 2.5, md: 4 }, py: 2.5 }}>
                <Button onClick={onClose} disabled={submitting} sx={{ textTransform: 'none', color: pa.textSecondary, fontWeight: 600 }}>
                    Cancel
                </Button>
                {isEdit ? (
                    <Button
                        variant="contained"
                        sx={primaryButtonSx}
                        disabled={submitting}
                        onClick={() => formik.submitForm()}
                        startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        Save changes
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="outlined"
                            sx={outlinedButtonSx}
                            disabled={submitting}
                            onClick={() => submitWithStatus('draft')}
                        >
                            Save as draft
                        </Button>
                        <Button
                            variant="contained"
                            sx={primaryButtonSx}
                            disabled={submitting}
                            onClick={() => submitWithStatus('active')}
                            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                            Publish
                        </Button>
                    </>
                )}
            </Stack>
        </Dialog>
    );
};

BannerFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    banner: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    user: PropTypes.object,
    existingIds: PropTypes.instanceOf(Set).isRequired
};
