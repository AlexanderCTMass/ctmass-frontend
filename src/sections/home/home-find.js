import {
    Box,
    Button,
    Container,
    Typography,
    useMediaQuery,
    Paper,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { keyframes } from '@mui/material/styles';
import { BRAND, RADIUS, SHADOW, reducedMotion } from 'src/theme/ctmass-tokens';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullLoadServicesAutocomplete from "src/components/FullLoadServicesAutocomplete";
import { RouterLink } from "src/components/router-link";
import { useAuth } from "src/hooks/use-auth";
import { trackClick } from 'src/libs/analytics/behavior';
import { paths } from "src/paths";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import { ProjectStatus } from "src/enums/project-state";
import { useNavigate } from "react-router-dom";
import { useSpecialties } from './home-hero';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import HandymanIcon from '@mui/icons-material/Handyman';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import ConstructionIcon from '@mui/icons-material/Construction';
import CarpenterIcon from '@mui/icons-material/Carpenter';
import RoofingIcon from '@mui/icons-material/Roofing';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FoundationIcon from '@mui/icons-material/Foundation';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import HouseIcon from '@mui/icons-material/House';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import BoltIcon from '@mui/icons-material/Bolt';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import WaterDamageIcon from '@mui/icons-material/WaterDamage';
import FireExtinguisherIcon from '@mui/icons-material/FireExtinguisher';
import CleanHandsIcon from '@mui/icons-material/CleanHands';
import YardIcon from '@mui/icons-material/Yard';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ForestIcon from '@mui/icons-material/Forest';
import ParkIcon from '@mui/icons-material/Park';
import LandscapeIcon from '@mui/icons-material/Landscape';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import EvStationIcon from '@mui/icons-material/EvStation';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import FactoryIcon from '@mui/icons-material/Factory';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BuildIcon from '@mui/icons-material/Build';
import DeckIcon from '@mui/icons-material/Deck';
import GarageIcon from '@mui/icons-material/Garage';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HardwareIcon from '@mui/icons-material/Hardware';

const SPECIALTY_ICONS = [
    PlumbingIcon,
    ElectricalServicesIcon,
    HandymanIcon,
    BuildCircleIcon,
    ConstructionIcon,
    CarpenterIcon,
    RoofingIcon,
    DesignServicesIcon,
    EngineeringIcon,
    FoundationIcon,
    ArchitectureIcon,
    HouseIcon,
    HomeRepairServiceIcon,
    MiscellaneousServicesIcon,
    PrecisionManufacturingIcon,
    SettingsSuggestIcon,
    BoltIcon,
    LightbulbIcon,
    FlashOnIcon,
    AutoFixHighIcon,
    WaterDamageIcon,
    FireExtinguisherIcon,
    CleanHandsIcon,
    YardIcon,
    GrassIcon,
    LocalFloristIcon,
    LocalFireDepartmentIcon,
    AgricultureIcon,
    ForestIcon,
    ParkIcon,
    LandscapeIcon,
    LocalCarWashIcon,
    LocalLaundryServiceIcon,
    DryCleaningIcon,
    SolarPowerIcon,
    AcUnitIcon,
    ThermostatIcon,
    DeviceThermostatIcon,
    BatteryChargingFullIcon,
    EvStationIcon,
    LocalShippingIcon,
    DirectionsCarIcon,
    DirectionsBoatIcon,
    FactoryIcon,
    ApartmentIcon,
    BuildIcon,
    DeckIcon,
    GarageIcon,
    LocalHospitalIcon,
    HardwareIcon
];

const NAVY = BRAND.navy;
const GREEN = BRAND.green;

const rise = keyframes`
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
`;

const enterSx = (delay) => ({
    animation: `${rise} .6s ${delay}s cubic-bezier(.2,.7,.2,1) both`,
    [reducedMotion]: { animation: 'none' }
});

const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

export const HomeFind = () => {
    const { user } = useAuth();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [tag, setTag] = useState();
    const [findService, setFindService] = useState();
    const [customService, setCustomService] = useState("");
    const navigate = useNavigate();
    const specialties = useSpecialties();
    const isWorker = user?.role === 'WORKER';

    const [iconAssignments, setIconAssignments] = useState({});
    const [iconsReady, setIconsReady] = useState(false);

    useEffect(() => {
        if (!specialties || specialties.length === 0) {
            setIconAssignments({});
            setIconsReady(false);
            return;
        }

        setIconsReady(false);

        setIconAssignments((prevAssignments) => {
            const nextAssignments = {};
            const activeIds = new Set(specialties.map((spec) => spec.id));

            Object.entries(prevAssignments || {}).forEach(([id, icon]) => {
                if (activeIds.has(id)) {
                    nextAssignments[id] = icon;
                }
            });

            const usedIcons = new Set(
                Object.values(nextAssignments).filter(Boolean)
            );

            const availableIcons = shuffleArray(
                SPECIALTY_ICONS.filter((Icon) => !usedIcons.has(Icon))
            );

            specialties.forEach((spec) => {
                if (nextAssignments[spec.id] !== undefined) {
                    return;
                }

                if (!availableIcons.length) {
                    nextAssignments[spec.id] = null;
                    return;
                }

                const shouldAssign = Math.random() < 0.85;
                nextAssignments[spec.id] = shouldAssign ? availableIcons.shift() : null;
            });

            return nextAssignments;
        });

        const frame = requestAnimationFrame(() => setIconsReady(true));
        return () => cancelAnimationFrame(frame);
    }, [specialties]);

    const listRef = useRef();
    const scrollBy = amount =>
        listRef.current?.scrollBy({ left: amount, behavior: 'smooth' });

    const servicesTags = useMemo(() => [], []);

    const createSearchParams = useCallback(() => {
        if (!findService) {
            projectsLocalApi.storeProject({
                state: ProjectStatus.DRAFT,
            })
        } else {
            if (findService.type === "Specialties") {
                projectsLocalApi.storeProject({
                    state: ProjectStatus.DRAFT,
                    specialtyId: findService?.id,
                })
            } else {
                projectsLocalApi.storeProject({
                    state: ProjectStatus.DRAFT,
                    specialtyId: findService?.parentSpecialty,
                    serviceId: findService?.id
                })
            }
        }
        navigate(paths.request.create);
    }, [navigate, findService])

    const createSearchSpecParams = useCallback((service) => {
        projectsLocalApi.storeProject({
            state: ProjectStatus.DRAFT,
            specialtyId: service.id
        })
        navigate(paths.request.create);
    }, [navigate])

    const handleNoOption = () => {
        projectsLocalApi.storeProject({
            state: ProjectStatus.DRAFT,
            notKnowSpecialistCategory: true,
            specialtyId: "other",
            customService: "Other services"
        });
        navigate(paths.request.create);
    };

    const handleDescribe = () => {
        trackClick('home_find_describe_project');
        createSearchParams();
    };

    return (
        <Box sx={{ mt: { xs: 0, md: -6 }, position: 'relative', zIndex: 4 }}>
            <form onSubmit={(event) => event.preventDefault()}>
                <Container maxWidth="lg">
                    {isWorker ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                maxWidth: { xs: '100%', md: 680 },
                                border: '1px solid',
                                borderColor: 'rgba(31,45,119,0.08)',
                                boxShadow: SHADOW.md,
                                ...enterSx(0.24)
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0, pl: 1 }}>
                                <WorkOutlineIcon sx={{ color: 'success.main', fontSize: 22 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    Browse available projects in your area
                                </Typography>
                            </Stack>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    py: 1.5,
                                    px: { xs: 2.5, sm: 4 },
                                    borderRadius: 3,
                                    backgroundColor: NAVY,
                                    '&:hover': { backgroundColor: '#16337F' },
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                                onClick={() => {
                                    trackClick('home_find_work');
                                    navigate(paths.cabinet.projects.find.index);
                                }}
                            >
                                Find a work
                            </Button>
                        </Paper>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1,
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                maxWidth: { xs: '100%', md: 680 },
                                border: '1px solid',
                                borderColor: 'rgba(31,45,119,0.08)',
                                boxShadow: SHADOW.md,
                                ...enterSx(0.24),
                                '& .MuiFilledInput-root, & .MuiFilledInput-root:hover, & .MuiFilledInput-root.Mui-focused': {
                                    backgroundColor: 'transparent'
                                },
                                '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { display: 'none' },
                                '& .MuiInputLabel-root': {
                                    fontSize: 12,
                                    fontWeight: 800,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase'
                                }
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <FullLoadServicesAutocomplete
                                    externalSearchText={tag}
                                    onChange={(service) => {
                                        if (!service?.other) {
                                            setFindService(service);
                                        }
                                    }}
                                    onInputChange={(value) => {
                                        setCustomService(value);
                                    }}
                                    allowCustomInput={false}
                                    onNoOptionClick={handleNoOption}
                                />
                            </Box>
                            {downSm ? (
                                <IconButton
                                    aria-label="Describe a project"
                                    data-track="home_find_describe_project"
                                    onClick={handleDescribe}
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        flexShrink: 0,
                                        borderRadius: RADIUS.tile,
                                        color: 'common.white',
                                        bgcolor: NAVY,
                                        '&:hover': { bgcolor: '#16337F' }
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<SearchIcon />}
                                    data-track="home_find_describe_project"
                                    onClick={handleDescribe}
                                    sx={{
                                        py: 1.75,
                                        px: 3.5,
                                        flexShrink: 0,
                                        fontSize: '1rem',
                                        borderRadius: 3,
                                        backgroundColor: NAVY,
                                        whiteSpace: 'nowrap',
                                        '&:hover': { backgroundColor: '#16337F' }
                                    }}
                                >
                                    Describe a project
                                </Button>
                            )}
                        </Paper>
                    )}
                </Container>
            </form>

            <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 6 }, ...enterSx(0.36) }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    {!downSm && (
                        <IconButton onClick={() => scrollBy(-320)} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'common.white' }}>
                            <ChevronLeftIcon />
                        </IconButton>
                    )}

                    {specialties.length === 0 || !iconsReady ? (
                        <Stack direction="row" spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
                            {Array.from({ length: downSm ? 4 : 8 }).map((_, i) => (
                                <Stack key={i} alignItems="center" spacing={1} sx={{ width: downSm ? 72 : 104, flexShrink: 0 }}>
                                    <Skeleton variant="rounded" width={downSm ? 52 : 64} height={downSm ? 52 : 64} sx={{ borderRadius: '16px' }} />
                                    <Skeleton variant="text" width="80%" />
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <Stack
                            direction="row"
                            ref={listRef}
                            sx={{
                                flexGrow: 1,
                                overflowX: 'auto',
                                scrollBehavior: 'smooth',
                                scrollbarWidth: 'none',
                                '::-webkit-scrollbar': { display: 'none' },
                                columnGap: { xs: 1, sm: 2 },
                                py: 1,
                                mx: { xs: -2, sm: 0 },
                                px: { xs: 2, sm: 0 }
                            }}
                        >
                            {specialties.map((spec, index) => {
                                const IconComponent = iconAssignments[spec.id];
                                const featured = index === 1;

                                return (
                                    <Stack
                                        key={spec.id}
                                        alignItems="center"
                                        spacing={0.75}
                                        sx={{
                                            width: { xs: 72, sm: 104 },
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            '&:hover .spec-tile': {
                                                borderColor: GREEN,
                                                color: GREEN,
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 10px 20px rgba(22,179,100,0.18)'
                                            }
                                        }}
                                        data-track="home_find_specialty_tag"
                                        onClick={() => {
                                            trackClick('home_find_specialty_tag', { specialtyId: spec.id });
                                            createSearchSpecParams(spec);
                                        }}
                                    >
                                        <Box
                                            className="spec-tile"
                                            sx={{
                                                width: { xs: 52, sm: 64 },
                                                height: { xs: 52, sm: 64 },
                                                borderRadius: RADIUS.inner,
                                                border: '1.5px solid',
                                                borderColor: featured ? GREEN : 'rgba(31,45,119,0.14)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: featured ? GREEN : 'rgba(31,45,119,0.7)',
                                                bgcolor: featured ? 'rgba(22,179,100,0.08)' : 'common.white',
                                                fontWeight: 700,
                                                fontSize: { xs: 20, sm: 24 },
                                                transition: 'all .2s ease'
                                            }}
                                        >
                                            {IconComponent ? (
                                                <IconComponent sx={{ fontSize: { xs: 24, sm: 28 } }} />
                                            ) : (
                                                spec.label?.[0] ?? '?'
                                            )}
                                        </Box>
                                        <Tooltip title={spec.label} arrow>
                                            <Typography
                                                noWrap
                                                textAlign="center"
                                                sx={{
                                                    width: '100%',
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    fontSize: { xs: 11, sm: 13 }
                                                }}
                                            >
                                                {spec.label}
                                            </Typography>
                                        </Tooltip>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    )}

                    {!downSm && (
                        <IconButton onClick={() => scrollBy(320)} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'common.white' }}>
                            <ChevronRightIcon />
                        </IconButton>
                    )}
                </Stack>
            </Container>
        </Box>
    );
};
