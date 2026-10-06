import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { BRAND, FONT, RADIUS, reducedMotion } from 'src/theme/ctmass-tokens';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { alpha, keyframes, useTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';

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

const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
`;

const useInView = (options) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || inView) return undefined;
        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return undefined;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                observer.disconnect();
            }
        }, options);
        observer.observe(node);
        return () => observer.disconnect();
    }, [inView, options]);

    return [ref, inView];
};

const OBSERVER_OPTIONS = { threshold: 0.25 };
const EASE = 'cubic-bezier(.2,.8,.2,1)';

const StepMarker = ({ number, shown, delay }) => (
    <Box
        sx={{
            position: 'relative',
            zIndex: 1,
            width: 52,
            height: 52,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FFFFFF',
            border: `2px solid ${shown ? ACCENT : alpha(ACCENT, 0.25)}`,
            boxShadow: shown ? `0 0 0 8px ${alpha(ACCENT, 0.1)}` : 'none',
            color: ACCENT,
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 20,
            transition: `border-color .4s ease ${delay}s, box-shadow .4s ease ${delay}s`
        }}
    >
        {number}
    </Box>
);

const DesktopTimeline = () => {
    const [ref, shown] = useInView(OBSERVER_OPTIONS);

    return (
        <Box ref={ref} sx={{ position: 'relative', maxWidth: 980, mx: 'auto' }}>
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: 40,
                    bottom: 40,
                    left: '50%',
                    width: 2,
                    transform: 'translateX(-1px)',
                    bgcolor: alpha(ACCENT, 0.15),
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        bgcolor: ACCENT,
                        transformOrigin: 'top',
                        transform: shown ? 'scaleY(1)' : 'scaleY(0)',
                        transition: `transform 1.4s ${EASE} .1s`,
                        [reducedMotion]: { transition: 'none', transform: 'scaleY(1)' }
                    }}
                />
            </Box>
            <Stack spacing={1}>
                {steps.map((step, index) => {
                    const left = index % 2 === 0;
                    const delay = 0.15 + index * 0.3;

                    return (
                        <Box
                            key={step.id}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 52px 1fr',
                                columnGap: 4,
                                alignItems: 'center'
                            }}
                        >
                            <Box
                                sx={{
                                    gridColumn: left ? 1 : 3,
                                    gridRow: 1,
                                    textAlign: left ? 'right' : 'left',
                                    opacity: shown ? 1 : 0,
                                    transform: shown ? 'none' : `translateX(${left ? -24 : 24}px)`,
                                    transition: `opacity .6s ${EASE} ${delay}s, transform .6s ${EASE} ${delay}s`,
                                    [reducedMotion]: { transition: 'none', opacity: 1, transform: 'none' }
                                }}
                            >
                                <Stack direction={left ? 'row-reverse' : 'row'} spacing={2.5} alignItems="center" sx={{ p: 2.5 }}>
                                    <Box
                                        sx={{
                                            flexShrink: 0,
                                            width: 84,
                                            height: 84,
                                            borderRadius: RADIUS.card,
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
                                        <Typography sx={{ fontFamily: FONT.display, fontSize: 26, fontWeight: 800, color: NAVY, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                                            {step.title}
                                        </Typography>
                                        <Typography sx={{ mt: 0.75, fontSize: 17, lineHeight: 1.55, color: BRAND.muted, maxWidth: 340, ml: left ? 'auto' : 0 }}>
                                            {step.desc}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            <Box sx={{ gridColumn: 2, gridRow: 1, display: 'flex', justifyContent: 'center' }}>
                                <StepMarker number={step.id} shown={shown} delay={delay} />
                            </Box>
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
};

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
        <HomeSection bg="mist">
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
