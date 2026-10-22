import { forwardRef } from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
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
import { OTHER_TRADE_LABEL, TRADE_ITEMS, findGroup, findTrade } from 'src/constants/trade-taxonomy';
import { IMaskInput } from 'react-imask';
import { isValidUSPhone } from 'src/utils/validation/phone';

const PhoneMaskInput = forwardRef((props, ref) => {
    const { onChange, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask="+1 (000) 000-0000"
            definitions={{ '0': /[0-9]/ }}
            inputRef={ref}
            onAccept={(value) => onChange({ target: { name: props.name, value } })}
            overwrite
        />
    );
});

const TRADE_OPTIONS = TRADE_ITEMS.map((item) => ({
    label: item.label,
    group: findGroup(item.groupId)?.label ?? OTHER_TRADE_LABEL
}));

function TradePrimaryDetails({
    values,
    onChange,
    onTradeChange,
    tradeError,
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
    const known = findTrade(values.primarySpecialtyLabel);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={3}>
                    <Typography variant="h6" fontWeight={700}>
                        Stand out to customers
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2
                        }}
                    >
                        <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                            <Autocomplete
                                freeSolo
                                options={TRADE_OPTIONS}
                                groupBy={(option) => option.group}
                                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                                value={values.primarySpecialtyLabel || null}
                                isOptionEqualToValue={(option, value) => option.label === (typeof value === 'string' ? value : value?.label)}
                                onChange={(_, next) => onTradeChange(typeof next === 'string' ? next : next?.label ?? '')}
                                onInputChange={(_, next, reason) => {
                                    if (reason === 'input') onTradeChange(next);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Primary trade"
                                        placeholder="Search trades, e.g. EV charger"
                                        error={Boolean(tradeError)}
                                        helperText={tradeError || (values.primarySpecialtyLabel && !known
                                            ? 'Custom trade. It will be listed under Other.'
                                            : 'Each trade gets its own page with its own experience, prices and reviews.')}
                                    />
                                )}
                            />
                        </Box>

                        <Box>
                            <Stack spacing={1.5}>
                                <TextField
                                    label="Phone number for this trade"
                                    fullWidth
                                    value={values.phone || ''}
                                    onChange={(event) => onChange('phone', event.target.value)}
                                    placeholder="+1 (123) 456-7890"
                                    disabled={values.useProfilePhone}
                                    error={!!values.phone && !values.useProfilePhone && !isValidUSPhone(values.phone)}
                                    helperText={
                                        values.useProfilePhone
                                            ? (values.phone ? 'Using your main profile phone' : 'No phone number set in your profile')
                                            : (!!values.phone && !isValidUSPhone(values.phone) ? 'Enter a valid US phone number (+1 and 10 digits)' : 'Customers will use this number to contact you')
                                    }
                                    InputProps={{ inputComponent: PhoneMaskInput }}
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
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2
                        }}
                    >
                        <Box>
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
                        </Box>

                        <Box>
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
                        </Box>
                    </Box>
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
