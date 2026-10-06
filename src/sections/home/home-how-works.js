import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { BRAND, reducedMotion } from 'src/theme/ctmass-tokens';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { alpha, keyframes, useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import SubmitRequestIcon from 'src/icons/untitled-ui/duocolor/submit-request';
import ReceiveResponsesIcon from 'src/icons/untitled-ui/duocolor/receive-responses';
import SelectSpecialistIcon from 'src/icons/untitled-ui/duocolor/select-specialist';
import LeaveAReviewIcon from 'src/icons/untitled-ui/duocolor/leave-a-review';

const ACCENT = BRAND.lavender;
const NAVY = BRAND.navy;
const GREEN = BRAND.green;

const steps = [
    {
        id: 1,
        short: 'Submit',
        title: 'Submit Request',
        desc: 'Post your project request with details to attract the right specialists.',
        icon: <SubmitRequestIcon />
    },
    {
        id: 2,
        short: 'Respond',
        title: 'Receive Responses',
        desc: 'Specialists review your project and submit their proposals.',
        icon: <ReceiveResponsesIcon />
    },
    {
        id: 3,
        short: 'Select',
        title: 'Select Specialist',
        desc: 'Compare proposals, check reviews and choose the best specialist for your project.',
        icon: <SelectSpecialistIcon />
    },
    {
        id: 4,
        short: 'Review',
        title: 'Leave a Review',
        desc: 'Once the work is done, share your experience by leaving a review for the specialist.',
        icon: <LeaveAReviewIcon />
    }
];

const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 ${alpha(ACCENT, 0.45)}; }
    70% { box-shadow: 0 0 0 12px ${alpha(ACCENT, 0)}; }
    100% { box-shadow: 0 0 0 0 ${alpha(ACCENT, 0)}; }
`;

const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
`;

const Dot = ({ active }) => (
    <Box
        sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(ACCENT, 0.22),
            position: 'relative',
            zIndex: 1,
            animation: active ? `${pulse} 2.4s ease-out 3` : 'none',
            [reducedMotion]: { animation: 'none' }
        }}
    >
        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: ACCENT }} />
    </Box>
);

const DesktopTimeline = () => (
    <Box sx={{ position: 'relative', maxWidth: 980, mx: 'auto' }}>
        <Box
            sx={{
                position: 'absolute',
                top: 30,
                bottom: 30,
                left: '50%',
                borderLeft: `2px dashed ${alpha(ACCENT, 0.35)}`,
                transform: 'translateX(-1px)'
            }}
        />
        <Stack spacing={1}>
            {steps.map((step, index) => {
                const left = index % 2 === 0;

                return (
                    <Box
                        key={step.id}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 34px 1fr',
                            columnGap: 4,
                            alignItems: 'center'
                        }}
                    >
                        <Box sx={{ gridColumn: left ? 1 : 3, gridRow: 1, textAlign: left ? 'right' : 'left' }}>
                            <Stack
                                direction={left ? 'row-reverse' : 'row'}
                                spacing={2.5}
                                alignItems="center"
                                sx={{
                                    p: 2.5,
                                    borderRadius: 4,
                                    transition: 'background-color .25s ease, transform .25s ease',
                                    '&:hover': { bgcolor: alpha(ACCENT, 0.06), transform: 'translateY(-2px)' }
                                }}
                            >
                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        width: 84,
                                        height: 84,
                                        borderRadius: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'radial-gradient(161% 161% at -75% 211%, #D5ECF7 0%, #F5F8FB 100%)',
                                        '& svg': { width: 52, height: 52 }
                                    }}
                                >
                                    {step.icon}
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: alpha(NAVY, 0.4) }}>
                                        Step {step.id}
                                    </Typography>
                                    <Typography sx={{ fontSize: 26, fontWeight: 800, color: ACCENT, lineHeight: 1.25 }}>
                                        {step.title}
                                    </Typography>
                                    <Typography sx={{ mt: 0.5, fontSize: 17, color: 'text.secondary', maxWidth: 340, ml: left ? 'auto' : 0 }}>
                                        {step.desc}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                        <Box sx={{ gridColumn: 2, gridRow: 1, display: 'flex', justifyContent: 'center' }}>
                            <Dot active={index === 0} />
                        </Box>
                    </Box>
                );
            })}
        </Stack>
    </Box>
);

const MobileSteps = () => {
    const [active, setActive] = useState(0);
    const [auto, setAuto] = useState(true);

    useEffect(() => {
        if (!auto) return undefined;
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') {
                setActive((value) => (value + 1) % steps.length);
            }
        }, 4000);
        return () => clearInterval(id);
    }, [auto]);

    const step = steps[active];

    return (
        <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1 }}>
                {steps.map((item, index) => {
                    const green = index % 2 === 1;
                    const selected = index === active;
                    const tone = green ? GREEN : NAVY;

                    return (
                        <Box
                            key={item.id}
                            component="button"
                            type="button"
                            onClick={() => {
                                setActive(index);
                                setAuto(false);
                            }}
                            sx={{
                                cursor: 'pointer',
                                font: 'inherit',
                                py: 1.25,
                                px: 0.5,
                                borderRadius: '14px',
                                textAlign: 'center',
                                border: `1.5px solid ${selected ? tone : alpha(tone, 0.14)}`,
                                bgcolor: selected ? alpha(tone, 0.1) : alpha(tone, 0.04),
                                transition: 'all .25s ease',
                                transform: selected ? 'translateY(-2px)' : 'none',
                                boxShadow: selected ? `0 8px 18px ${alpha(tone, 0.18)}` : 'none'
                            }}
                        >
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: alpha(tone, 0.45) }}>
                                {String(item.id).padStart(2, '0')}
                            </Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: tone }}>
                                {item.short}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            <Stack
                key={step.id}
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                    mt: 1.5,
                    p: 2,
                    borderRadius: '18px',
                    background: 'radial-gradient(161% 161% at -75% 211%, #D5ECF7 0%, #F5F8FB 100%)',
                    animation: `${fadeUp} .35s ease`,
                    [reducedMotion]: { animation: 'none' }
                }}
            >
                <Box sx={{ flexShrink: 0, '& svg': { width: 44, height: 44 } }}>{step.icon}</Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{step.title}</Typography>
                    <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.45 }}>{step.desc}</Typography>
                </Box>
            </Stack>

            <Box sx={{ mt: 1.25, height: 3, borderRadius: 3, bgcolor: alpha(ACCENT, 0.15), overflow: 'hidden' }}>
                <Box
                    sx={{
                        height: '100%',
                        width: `${((active + 1) / steps.length) * 100}%`,
                        bgcolor: ACCENT,
                        borderRadius: 3,
                        transition: 'width .4s ease'
                    }}
                />
            </Box>
        </Box>
    );
};

export const HomeHowWorks = () => {
    const theme = useTheme();
    const downMd = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <HomeSection bg="white">
            {downMd ? (
                <>
                    <SectionHeading
                        title="How it works!"
                        subtitle="From request to review in four steps."
                        sx={{ mb: 2.5 }}
                    />
                    <MobileSteps />
                </>
            ) : (
                <>
                    <SectionHeading
                        align="center"
                        title="How it works!"
                        subtitle="From request to review in four steps. No fees for homeowners at any point."
                        sx={{ mb: 7 }}
                    />
                    <DesktopTimeline />
                </>
            )}
        </HomeSection>
    );
};

export default HomeHowWorks;
