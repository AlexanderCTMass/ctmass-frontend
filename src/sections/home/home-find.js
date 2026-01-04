import {
    Box,
    Button,
    Container,
    Grid,
    Link,
    Typography,
    useMediaQuery,
    Paper,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
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

const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

export const HomeFind = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [tag, setTag] = useState();
    const [findService, setFindService] = useState();
    const [customService, setCustomService] = useState("");
    const navigate = useNavigate();
    const specialties = useSpecialties();

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

    return (
        <Box sx={{ mt: -6 }}>
            <form onSubmit={(event) => event.preventDefault()}>
                <Container maxWidth="lg">
                    <Grid container spacing={2} direction={downSm ? 'column' : 'row'} alignItems="stretch">
                        {!downSm &&
                            <Grid item xs={12} sm={6} md={5}>
                                <FullLoadServicesAutocomplete externalSearchText={tag}
                                    onChange={(service) => {
                                        if (!service?.other) {
                                            setFindService(service);
                                        }
                                    }}
                                    onInputChange={(value) => {
                                        setCustomService(value);
                                    }}
                                    allowCustomInput={false}
                                    onNoOptionClick={() => {
                                        projectsLocalApi.storeProject({
                                            state: ProjectStatus.DRAFT,
                                            notKnowSpecialistCategory: true,
                                            specialtyId: "other",
                                            customService: "Other services"
                                        })
                                        navigate(paths.request.create);
                                    }}
                                />
                            </Grid>}
                        <Grid item xs={downSm ? 12 : 3} sm="auto">
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{
                                    py: 2,
                                    fontSize: '1rem',
                                    borderRadius: 2,
                                    backgroundColor: '#1F2D77',
                                    '&:hover': { backgroundColor: '#16337F' },
                                    mb: 4,
                                }}
                                data-track="home_find_describe_project"
                                onClick={() => {
                                    trackClick('home_find_describe_project');
                                    createSearchParams();
                                }}
                            >
                                Describe a project
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </form>

            <Grid sx={{ mt: 5, ml: 1, mr: 1 }}>
                <Paper
                    elevation={3}
                    sx={{
                        pl: 4,
                        pr: 4,
                        mx: 'auto',
                        maxWidth: 1320,
                        height: 158,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        zIndex: 3,
                        position: 'relative'
                    }}
                >
                    <IconButton onClick={() => scrollBy(-260)}>
                        <ChevronLeftIcon fontSize="large" />
                    </IconButton>

                    {specialties.length === 0 || !iconsReady ? (
                        <Stack
                            direction="row"
                            spacing={4}
                            sx={{ flexGrow: 1, px: 2, justifyContent: 'center' }}
                        >
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    variant="rectangular"
                                    width={120}
                                    height={124}
                                    animation="wave"
                                    sx={{ borderRadius: 1 }}
                                />
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
                                '::-webkit-scrollbar': { display: 'none' },
                                columnGap: downSm ? 4 : 6,
                                px: 2,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {specialties.map(spec => {
                                const IconComponent = iconAssignments[spec.id];

                                return (
                                    <Stack
                                        key={spec.id}
                                        alignItems="center"
                                        spacing={1}
                                        sx={{ minWidth: 120, cursor: 'pointer' }}
                                        data-track="home_find_specialty_tag"
                                        onClick={() => {
                                            trackClick('home_find_specialty_tag', { specialtyId: spec.id });
                                            createSearchSpecParams(spec);
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 2,
                                                border: `2px solid ${theme.palette.primary.main}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'primary.main',
                                                bgcolor: 'common.white',
                                                fontWeight: 600,
                                                fontSize: 24
                                            }}
                                        >
                                            {IconComponent ? (
                                                <IconComponent fontSize="medium" />
                                            ) : (
                                                spec.label?.[0] ?? '?'
                                            )}
                                        </Box>
                                        <Tooltip title={spec.label} arrow>
                                            <Typography
                                                fontWeight={500}
                                                textAlign="center"
                                                noWrap
                                                sx={{
                                                    width: '100%',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
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

                    <IconButton onClick={() => scrollBy(260)}>
                        <ChevronRightIcon fontSize="large" />
                    </IconButton>
                </Paper>
            </Grid>
        </Box>
    );
};