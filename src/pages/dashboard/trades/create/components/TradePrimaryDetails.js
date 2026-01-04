import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddAPhotoOutlinedIcon from '@mui/icons-material/AddAPhotoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

function TradePrimaryDetails({
    values,
    onChange,
    professionalRoleOptions,
    onAvatarUploadClick,
    onApplyProfileAvatar,
    fileInputRef,
    onAvatarFileChange,
    loadingProfile,
    onOpenAiAvatarModal,
    aiGenerationsLeft
}) {
    const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'));

    const generationsLeft = typeof aiGenerationsLeft === 'number' ? aiGenerationsLeft : 0;
    const hasGenerationsLeft = generationsLeft > 0;

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={3}>
                    <Typography variant="h6" fontWeight={700}>
                        Stand out to customers
                    </Typography>

                    <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Business Name / Company"
                                fullWidth
                                value={values.businessName}
                                onChange={(event) => onChange('businessName', event.target.value)}
                                placeholder="Acme Inc."
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Company Professional Role"
                                select
                                fullWidth
                                value={values.professionalRole}
                                onChange={(event) => onChange('professionalRole', event.target.value)}
                                placeholder="Select role"
                                SelectProps={{ displayEmpty: true }}
                            >
                                {professionalRoleOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Stack spacing={1.5}>
                                <TextField
                                    label="Phone number for this trade"
                                    fullWidth
                                    value={values.phone}
                                    onChange={(event) => onChange('phone', event.target.value)}
                                    placeholder="+1 (123) 456-7890"
                                    disabled={values.useProfilePhone}
                                    helperText={
                                        values.useProfilePhone
                                            ? 'Using your main profile phone'
                                            : 'Customers will use this number to contact you'
                                    }
                                />
                                <Button
                                    size="small"
                                    variant="text"
                                    sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                                    onClick={() => onChange('useProfilePhone', !values.useProfilePhone)}
                                >
                                    {values.useProfilePhone ? 'Use another phone number' : 'Use main profile number'}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2.5}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Business Logo / Personal Trade Photo
                                </Typography>

                                <Box
                                    sx={{
                                        width: 160,
                                        height: 160,
                                        borderRadius: 4,
                                        border: (theme) => `1px dashed ${theme.palette.divider}`,
                                        bgcolor: 'background.default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    {values.avatarUrl ? (
                                        <Box
                                            component="img"
                                            src={values.avatarUrl}
                                            alt="Trade avatar"
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <PersonOutlineOutlinedIcon sx={{ fontSize: 50, color: 'text.disabled' }} />
                                    )}
                                </Box>

                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                    useFlexGap
                                    flexWrap="wrap"
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={<AddAPhotoOutlinedIcon />}
                                        onClick={onAvatarUploadClick}
                                        sx={{ minWidth: 200, textTransform: 'none', mb: 0.5 }}
                                    >
                                        Upload
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={onApplyProfileAvatar}
                                        sx={{ minWidth: 200, textTransform: 'none', mb: 0.5 }}
                                    >
                                        Use Main Profile Avatar
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AutoAwesomeIcon />}
                                        onClick={onOpenAiAvatarModal}
                                        disabled={!hasGenerationsLeft || loadingProfile}
                                        sx={{ minWidth: 200, textTransform: 'none' }}
                                    >
                                        Generate AI Avatar
                                    </Button>
                                </Stack>

                                <Typography
                                    variant="caption"
                                    color={hasGenerationsLeft ? 'text.secondary' : 'error.main'}
                                >
                                    Generations left today: {generationsLeft}
                                </Typography>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={onAvatarFileChange}
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    height: mdDown ? '90%' : '60%',
                                    borderRadius: 3,
                                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: 'center',
                                    gap: { xs: 2, sm: 3 },
                                    p: { xs: 2.5, md: 3.5 }
                                }}
                            >
                                <Stack spacing={1.5}>
                                    <Chip
                                        icon={<LightbulbOutlinedIcon fontSize="small" />}
                                        label="Photo recommendation"
                                        color="primary"
                                        size="small"
                                        sx={{ alignSelf: 'flex-start', borderRadius: 1.5 }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        For higher client trust and better visibility, upload a real profile photo.
                                        Specialists with photos rank higher in search results and attract more bookings.
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        No photo? You can generate one using our AI tool!
                                    </Typography>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
}

TradePrimaryDetails.defaultProps = {
    onOpenAiAvatarModal: () => { },
    aiGenerationsLeft: 5
};

export default TradePrimaryDetails;