import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { IconTile } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const TARGET = 1000;

const WorkersCounterCompact = () => {
    const [count, setCount] = useState(0);
    const [show, setShow] = useState(true);
    const boxRef = useRef(null);

    useEffect(() => {
        const root = document.documentElement;
        const node = boxRef.current;
        if (!show || !count || !node || typeof ResizeObserver === 'undefined') {
            root.style.removeProperty('--ctmass-counter-offset');
            return undefined;
        }
        const mobile = window.matchMedia('(max-width: 899.95px)');
        const update = () => {
            if (mobile.matches) {
                root.style.setProperty('--ctmass-counter-offset', `${Math.ceil(node.getBoundingClientRect().height) + 12}px`);
            } else {
                root.style.removeProperty('--ctmass-counter-offset');
            }
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(node);
        mobile.addEventListener?.('change', update);
        return () => {
            observer.disconnect();
            mobile.removeEventListener?.('change', update);
            root.style.removeProperty('--ctmass-counter-offset');
        };
    }, [show, count]);

    useEffect(() => {
        try {
            const lastClosed = localStorage.getItem('workersCounterClosed');
            if (lastClosed && parseInt(lastClosed, 10) > Date.now() - 2 * 60 * 60 * 1000) {
                setShow(false);
            }
        } catch (e) {
            setShow(true);
        }

        const fetchWorkersCount = async () => {
            const q = query(collection(firestore, 'profiles'), where('role', '==', 'WORKER'));
            const snapshot = await getCountFromServer(q);
            setCount(snapshot.data().count + 41);
        };

        fetchWorkersCount().catch(() => {});
    }, []);

    const handleClose = () => {
        setShow(false);
        try {
            localStorage.setItem('workersCounterClosed', Date.now().toString());
        } catch (e) {
            setShow(false);
        }
    };

    if (!show || !count) return null;

    const progress = Math.min((count / TARGET) * 100, 100);

    return (
        <Box
            ref={boxRef}
            role="status"
            sx={{
                position: 'fixed',
                zIndex: (theme) => theme.zIndex.speedDial,
                left: { xs: 12, md: 'auto' },
                right: { xs: 12, md: 24 },
                bottom: { xs: 'calc(12px + var(--ctmass-floating-offset, 0px))', md: 'calc(100px + var(--ctmass-floating-offset, 0px))' },
                width: { md: 280 },
                p: 1.5,
                pr: 5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: '#FFFFFF',
                borderRadius: RADIUS.card,
                border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                boxShadow: SHADOW.md,
                transition: 'bottom .3s cubic-bezier(.2,.8,.2,1)'
            }}
        >
            <IconTile size={40}><GroupsRoundedIcon /></IconTile>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 15, color: BRAND.navy, fontVariantNumeric: 'tabular-nums' }}>
                    {count.toLocaleString('en-US')} of {TARGET.toLocaleString('en-US')} pros
                </Typography>
                <Box sx={{ mt: 0.75, height: 6, borderRadius: RADIUS.pill, bgcolor: alpha(BRAND.navy, 0.08), overflow: 'hidden' }}>
                    <Box sx={{ width: `${progress}%`, height: '100%', borderRadius: RADIUS.pill, bgcolor: BRAND.green }} />
                </Box>
                <Typography noWrap sx={{ mt: 0.5, fontSize: 12, color: BRAND.muted }}>
                    Joined so far. Invite your colleagues.
                </Typography>
            </Box>
            <IconButton
                aria-label="Hide"
                size="small"
                onClick={handleClose}
                sx={{ position: 'absolute', right: 6, top: 6, color: BRAND.muted }}
            >
                <CloseRoundedIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default WorkersCounterCompact;
