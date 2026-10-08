import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import zipcodes from 'zipcodes';
import { Box, Button, Chip, Container, Drawer, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { useDebounce } from 'use-debounce';
import geodist from 'geodist';
import { projectsApi } from "src/api/projects";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import { profileService } from "src/service/profile-service";
import { profileApi } from "src/api/profile";
import { ProjectStatus } from "src/enums/project-state";
import { getSiteDuration } from "src/utils/date-locale";
import useDictionaries from "src/hooks/use-dictionaries";
import { usePageView } from "src/hooks/use-page-view";
import { Seo } from "src/components/seo";
import { mapSpecialistToPreviewData } from "src/utils/preview-card-utils";
import VerticalPreviewCard from "src/components/profiles/previewCards/vertical-preview-card";
import { RouterLink } from "src/components/router-link";
import { paths } from "src/paths";
import { BRAND, RADIUS } from 'src/theme/ctmass-tokens';
import { EmptyState, PageHero, btn, cardTitleSx, surfaceSx } from 'src/components/ctmass-ui';
import { isValidZip, SpecialistsFilterFields, SpecialistsSearchBar } from './specialists-filter-panel';

const resultsGridSx = {
    display: 'grid',
    gridTemplateColumns: {
        xs: 'repeat(2, minmax(0, 1fr))',
        lg: 'repeat(3, minmax(0, 1fr))'
    },
    gap: { xs: 1.5, sm: 2.5, md: 3 }
};

const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [zipCode, setZipCode] = useState('');
    const [error, setError] = useState(null);
    const [resolvedOnce, setResolvedOnce] = useState(false);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setLocation(coords);

                if (resolvedOnce) return;

                try {
                    // Документация: https://nominatim.org/release-docs/latest/api/Reverse/
                    const url = new URL('https://nominatim.openstreetmap.org/reverse');
                    url.searchParams.set('format', 'jsonv2');
                    url.searchParams.set('lat', String(coords.lat));
                    url.searchParams.set('lon', String(coords.lng));
                    url.searchParams.set('addressdetails', '1');

                    const res = await fetch(url.toString(), {
                        headers: {
                            'Accept': 'application/json',
                        },
                    });

                    if (!res.ok) {
                        throw new Error(`Reverse geocoding failed: ${res.status}`);
                    }

                    const data = await res.json();
                    const preciseZip =
                        data?.address?.postcode ||
                        data?.address?.postal_code ||
                        data?.address?.zip;

                    if (preciseZip) {
                        const five = String(preciseZip).match(/\d{5}/)?.[0] || '';
                        if (five) {
                            setZipCode(five);
                            setResolvedOnce(true);
                            return;
                        }
                    }

                    try {
                        const nearest = zipcodes.lookupByCoords(coords.lat, coords.lng);
                        if (nearest?.zip) {
                            setZipCode(nearest.zip);
                            setResolvedOnce(true);
                        } else {
                            const nearby = zipcodes.radius(coords.lat, coords.lng, 5);
                            if (nearby?.length > 0) {
                                setZipCode(nearby[0].zip);
                                setResolvedOnce(true);
                            } else {
                                console.warn('No ZIP code found for coordinates:', coords);
                            }
                        }
                    } catch (fallbackErr) {
                        console.error('zipcodes fallback failed:', fallbackErr);
                    }
                } catch (err) {
                    console.error('Error during reverse geocoding:', err);
                    setError(err.message || 'Could not reverse geocode your location');
                    try {
                        const nearest = zipcodes.lookupByCoords(coords.lat, coords.lng);
                        if (nearest?.zip) {
                            setZipCode(nearest.zip);
                            setResolvedOnce(true);
                        }
                    } catch (fallbackErr) {
                        console.error('zipcodes fallback failed:', fallbackErr);
                    }
                }
            },
            (err) => {
                setError(err.message || 'Could not get your location');
            },
            {
                enableHighAccuracy: true,
                maximumAge: 60_000,
                timeout: 10_000,
            }
        );
    }, [resolvedOnce]);

    return { location, zipCode, error };
};

const useSpecialists = (selectedSpecialtyIds) => {
    const [specialists, setSpecialists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSpecialistsGet = async () => {
        // if (!selectedSpecialtyIds || selectedSpecialtyIds.length === 0) {
        //     setSpecialists([]);
        //     return;
        // }

        try {
            setLoading(true);
            setError(null);

            let merged = [];

            if (!selectedSpecialtyIds || selectedSpecialtyIds.length === 0) {
                const all = await profileApi.getUsersWithoutSpecialties(1000).catch(e => {
                    console.error('Error fetching all profiles:', e)
                    return []
                })
                merged = all;
            } else {
                const lists = await Promise.all(
                    selectedSpecialtyIds.map(id =>
                        profileApi.getUsers(id).catch(e => {
                            console.error(`Error fetching users for specialty ${id}:`, e);
                            return [];
                        })
                    )
                );
                const seen = new Set();
                lists.flat().forEach(user => {
                    if (user?.id && !seen.has(user.id)) {
                        seen.add(user.id)
                        merged.push(user)
                    }
                })
            }

            if (!merged && merged.length === 0) {
                setSpecialists([]);
                setLoading(false);
                return;
            }

            const userProjectsPromises = merged.map(user =>
                projectsApi.getUserProjects(user.id, 1000).catch(e => {
                    console.error(`Error fetching projects for user ${user.id}:`, e);
                    return [];
                })
            );

            const reviewsPromises = merged.map(user =>
                extendedProfileApi.getReviews(user.id).catch(e => {
                    console.error(`Error fetching reviews for user ${user.id}:`, e);
                    return [];
                })
            );

            const specialtiesPromises = merged.map(user =>
                extendedProfileApi.getUserSpecialties(user.id).catch(e => {
                    console.error(`Error fetching specialties for user ${user.id}:`, e);
                    return [];
                })
            );

            const [userProjectsResults, userReviewsResults, userSpecialtiesResults] = await Promise.all([
                Promise.all(userProjectsPromises),
                Promise.all(reviewsPromises),
                Promise.all(specialtiesPromises)
            ]);

            const processedSpecialists = merged.map((specialist, index) => {
                const projects = Array.isArray(userProjectsResults[index]) ? userProjectsResults[index] : [];
                const reviews = Array.isArray(userReviewsResults[index]) ? userReviewsResults[index] : [];
                const specialtiesForUser = Array.isArray(userSpecialtiesResults[index]) ? userSpecialtiesResults[index] : [];

                const specialtyIds = specialtiesForUser.map(s => s.specialty);

                const completedProjects = projects.filter(p =>
                    p && p.state === ProjectStatus.COMPLETED
                );

                const updatedSpecialist = profileService.updateRatingInfo(
                    { ...specialist },
                    reviews
                );

                const gallery = completedProjects
                    .flatMap(p => p.photos || [])
                    .filter(photo => photo)
                    .slice(0, 14);

                return {
                    ...updatedSpecialist,
                    since: specialist?.registrationAt
                        ? getSiteDuration(specialist.registrationAt.toDate())
                        : null,
                    completedProjects: completedProjects.length,
                    gallery,
                    commonContacts: 0,
                    coordinates: specialist.address?.location?.center,
                    duration: specialist.address?.duration,
                    reviewsLength: reviews.length,
                    rating: updatedSpecialist.rating || 0,
                    createdAt: specialist?.createdAt || specialist?.registrationAt,
                    specialtyIds
                };
            });

            setSpecialists(processedSpecialists);
        } catch (err) {
            console.error('Error in handleSpecialistsGet:', err);
            setError(err.message || "Failed to load specialists");
            setSpecialists([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSpecialistsGet();
    }, [JSON.stringify(selectedSpecialtyIds)]);

    return { specialists, loading, error };
};


const Page = () => {
    const { specialtyId } = useParams();
    const { location, zipCode: detectedZipCode, error: locationError } = useGeolocation();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { specialties } = useDictionaries();
    const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState(
        specialtyId ? [specialtyId] : []
    );

    const theme = useTheme();
    const [filters, setFilters] = useState({
        businessName: '',
        radius: 30,
        tags: [],
        language: '',
        status: '',
        zipCode: ''
    });
    const [debouncedFilters] = useDebounce(filters, 300);

    useEffect(() => {
        if (specialtyId) {
            setSelectedSpecialtyIds([specialtyId]);
        }
    }, [specialtyId]);

    useEffect(() => {
        if (detectedZipCode && !filters.zipCode) {
            setFilters(prev => ({ ...prev, zipCode: detectedZipCode }));
        }
    }, [detectedZipCode]);

    const handleResetFilters = useCallback(() => {
        setFilters({
            businessName: '',
            radius: 30,
            tags: [],
            language: '',
            status: '',
            zipCode: ''
        });
        setSelectedSpecialtyIds([]);
    }, []);

    const { specialists, loading, error } = useSpecialists(selectedSpecialtyIds);

    const availableSpecialties = useMemo(() => {
        if (!specialties?.byId) return [];
        return Object.values(specialties.byId);
    }, [specialties]);

    const filterSpecialists = useCallback((userSpecialties) => {
        if (!userSpecialties) return [];

        return userSpecialties.filter((specialist) => {
            if (debouncedFilters.businessName &&
                !(specialist.businessName || '').toLowerCase().includes(debouncedFilters.businessName.toLowerCase())) {
                return false;
            }

            if (debouncedFilters.tags.length > 0) {
                const hasMatchingTags = debouncedFilters.tags.some(filterTag =>
                    specialist.tags?.some(specialistTag =>
                        specialistTag.toLowerCase().startsWith(filterTag.toLowerCase())
                    ) || false
                );
                if (!hasMatchingTags) return false;
            }

            if (debouncedFilters.language &&
                (!specialist.languages || !specialist.languages.includes(debouncedFilters.language))) {
                return false;
            }

            if (debouncedFilters.status === 'available' && specialist.busyUntil) {
                return false;
            }
            if (debouncedFilters.status === 'busy' && !specialist.busyUntil) {
                return false;
            }

            if (debouncedFilters.radius) {
                const specialistCenter = specialist.address?.location?.center;
                const coordsFromCenter = Array.isArray(specialistCenter) && specialistCenter.length === 2
                    ? { lat: specialistCenter[1], lon: specialistCenter[0] }
                    : null;

                const coordsFromField = Array.isArray(specialist.coordinates) && specialist.coordinates.length === 2
                    ? { lat: specialist.coordinates[1], lon: specialist.coordinates[0] }
                    : null;

                const specialistCoord = coordsFromCenter || coordsFromField;

                if (debouncedFilters.zipCode) {
                    const userZipInfo = zipcodes.lookup(debouncedFilters.zipCode);
                    if (userZipInfo && specialistCoord) {
                        const distance = geodist(
                            { lat: userZipInfo.latitude, lon: userZipInfo.longitude },
                            specialistCoord,
                            { exact: true, unit: 'mi' }
                        );
                        if (distance > debouncedFilters.radius) return false;
                    } else if (location && specialistCoord) {
                        const distance = geodist(
                            { lat: location.lat, lon: location.lng },
                            specialistCoord,
                            { exact: true, unit: 'mi' }
                        );
                        if (distance > debouncedFilters.radius) return false;
                    } else {
                        return true;
                    }
                } else if (location && specialistCoord) {
                    const distance = geodist(
                        { lat: location.lat, lon: location.lng },
                        specialistCoord,
                        { exact: true, unit: 'mi' }
                    );
                    if (distance > debouncedFilters.radius) return false;
                } else {
                    return true;
                }
            }

            return true;
        });
    }, [debouncedFilters, location]);

    const filteredSpecialists = useMemo(() => {
        return filterSpecialists(specialists);
    }, [specialists, filterSpecialists]);

    const grouped = useMemo(() => {
        const items = [...filteredSpecialists];

        const bestRated = items.filter(s => (s.rating || 0) >= 4.9)
            .sort((a, b) => (b.rating - a.rating) || ((b.reviewsLength || 0) - (a.reviewsLength || 0)));

        const restAfterBest = items.filter(s => !bestRated.includes(s));

        const normalizedDate = (s) => {
            const d = s.createdAt || s.registrationAt;
            if (!d) return 0;
            try {
                if (typeof d?.toDate === 'function') return d.toDate().getTime();
                if (d instanceof Date) return d.getTime();
                return new Date(d).getTime();
            } catch {
                return 0;
            }
        };

        const now = Date.now();
        const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;

        const recently = restAfterBest
            .filter(s => (now - normalizedDate(s)) <= threeMonthsMs && normalizedDate(s) > 0)
            .sort((a, b) => normalizedDate(b) - normalizedDate(a));

        const other = restAfterBest.filter(s => !recently.includes(s));

        return { bestRated, recently, other };
    }, [filteredSpecialists]);

    const activeFilters = useMemo(() => {
        const list = Object.entries(debouncedFilters)
            .filter(([key, value]) =>
                value && (Array.isArray(value) ? value.length > 0 : true)
            )
            .map(([key, value]) => ({
                key,
                label: `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
            }));

        if (selectedSpecialtyIds.length > 0 && specialties?.byId) {
            const labels = selectedSpecialtyIds.map(id => specialties.byId[id]?.label || id);
            list.unshift({
                key: '__specialties__',
                label: `specialties: ${labels.join(', ')}`
            });
        }

        return list
    }, [debouncedFilters, selectedSpecialtyIds, specialties]);

    const removeFilter = useCallback((filterKey) => {
        if (filterKey === '__specialties__') {
            setSelectedSpecialtyIds([]);
            return;
        }
        setFilters(prev => ({
            ...prev,
            [filterKey]: Array.isArray(prev[filterKey]) ? [] : ''
        }));
    }, []);

    usePageView();

    const headerText = useMemo(() => {
        if (!specialties?.byId) return "list";
        if (selectedSpecialtyIds.length === 0) return "list";
        if (selectedSpecialtyIds.length === 1) {
            const s = specialties.byId[selectedSpecialtyIds[0]];
            return s?.label || "list";
        }
        return "multiple specialties";
    }, [selectedSpecialtyIds, specialties]);

    const isIndexPageNoSelection = selectedSpecialtyIds.length === 0 && !specialtyId;

    const filterLabels = {
        businessName: (value) => `Name: ${value}`,
        radius: (value) => `Within ${value} mi`,
        tags: (value) => `Tags: ${value.filter(Boolean).join(', ')}`,
        language: (value) => value,
        status: (value) => (value === 'busy' ? 'Busy' : 'Available'),
        zipCode: (value) => `ZIP ${value}`
    };

    const filterChips = activeFilters
        .filter((filter) => filter.key !== 'tags' || debouncedFilters.tags.some(Boolean))
        .filter((filter) => filter.key !== 'zipCode' || isValidZip(debouncedFilters.zipCode))
        .map((filter) => {
            if (filter.key === '__specialties__') {
                return { key: filter.key, label: filter.label.replace(/^specialties: /, '') };
            }

            return { key: filter.key, label: filterLabels[filter.key]?.(debouncedFilters[filter.key]) || filter.label };
        });

    const filterFieldsProps = {
        filters,
        setFilters,
        onReset: handleResetFilters,
        locationError,
        availableSpecialties,
        selectedSpecialtyIds,
        onSpecialtiesChange: setSelectedSpecialtyIds,
        isLoading: loading
    };

    const groups = [
        { key: 'best', title: 'Best rated', hint: 'Rated 4.9 and up by their clients', list: grouped.bestRated },
        { key: 'recent', title: 'New on CTMASS', hint: 'Joined in the last three months', list: grouped.recently },
        { key: 'other', title: 'More specialists', hint: null, list: grouped.other }
    ].filter((group) => group.list.length > 0);

    const renderSpecialistCards = (list) => (
        <Box sx={resultsGridSx}>
            {list.map((specialist) => {
                const labels = (specialist.specialtyIds || [])
                    .map(id => specialties?.byId?.[id]?.label)
                    .filter(Boolean);
                return (
                    <Box
                        key={specialist.id}
                        component={RouterLink}
                        href={paths.specialist.publicPage.replace(':profileId', specialist.id)}
                        sx={{ textDecoration: 'none', display: 'block', height: '100%', minWidth: 0 }}
                    >
                        <VerticalPreviewCard
                            data={mapSpecialistToPreviewData({ ...specialist, specialtyLabels: labels }, theme)}
                            theme={theme}
                        />
                    </Box>
                );
            })}
        </Box>
    );

    const pageTitle = headerText === 'list'
        ? 'Find a specialist'
        : headerText === 'multiple specialties'
            ? 'Specialists for your project'
            : `${headerText} specialists`;

    return (
        <>
            <Seo title={headerText === 'list' ? 'Find a specialist' : pageTitle} />
            <PageHero
                title={pageTitle}
                subtitle="Local construction and home improvement pros in Connecticut and Massachusetts. Compare ratings, then open a profile to get in touch."
                sx={{ pb: { xs: 3, md: 5 } }}
            >
                <SpecialistsSearchBar
                    filters={filters}
                    setFilters={setFilters}
                    isLoading={loading}
                    onOpenFilters={() => setFiltersOpen(true)}
                    activeCount={filterChips.length}
                />
            </PageHero>

            <Box component="main" sx={{ flexGrow: 1, bgcolor: BRAND.mist, pt: { xs: 3, md: 5 }, pb: { xs: 7, md: 12 } }}>
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '280px minmax(0, 1fr)' },
                            alignItems: 'start',
                            gap: { xs: 3, md: 4, lg: 5 }
                        }}
                    >
                        <Box
                            component="aside"
                            aria-label="Filters"
                            sx={{
                                ...surfaceSx,
                                display: { xs: 'none', md: 'block' },
                                position: 'sticky',
                                top: 118,
                                maxHeight: 'calc(100vh - 134px)',
                                overflowY: 'auto',
                                borderRadius: RADIUS.card,
                                p: 3
                            }}
                        >
                            <SpecialistsFilterFields {...filterFieldsProps} />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                flexWrap="wrap"
                                sx={{ columnGap: 2, rowGap: 1.25, mb: { xs: 2.5, md: 3.5 }, minHeight: 36 }}
                            >
                                <Typography
                                    component="p"
                                    aria-live="polite"
                                    sx={{ ...cardTitleSx, fontSize: { xs: 20, md: 24 }, fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {loading
                                        ? 'Looking for specialists'
                                        : `${filteredSpecialists.length} ${filteredSpecialists.length === 1 ? 'specialist' : 'specialists'}`}
                                </Typography>
                                {filterChips.length > 0 && (
                                    <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.75 }}>
                                        {filterChips.map((filter) => (
                                            <Chip
                                                key={filter.key}
                                                label={filter.label}
                                                onDelete={() => removeFilter(filter.key)}
                                                sx={{
                                                    maxWidth: 260,
                                                    height: 32,
                                                    borderRadius: '10px',
                                                    bgcolor: '#FFFFFF',
                                                    border: `1px solid ${alpha(BRAND.navy, 0.14)}`,
                                                    color: BRAND.navy,
                                                    fontWeight: 600,
                                                    '& .MuiChip-deleteIcon': { color: alpha(BRAND.navy, 0.45), '&:hover': { color: BRAND.navy } }
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Stack>

                            {loading && (
                                <Box sx={resultsGridSx}>
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <Skeleton key={index} variant="rounded" sx={{ borderRadius: RADIUS.card, height: { xs: 300, sm: 420 } }} />
                                    ))}
                                </Box>
                            )}

                            {!loading && error && (
                                <EmptyState
                                    icon={<SearchOffRoundedIcon />}
                                    title="We could not load specialists"
                                    text="Check your connection and reload the page."
                                    action={<Button onClick={() => window.location.reload()} sx={btn.navy}>Reload</Button>}
                                />
                            )}

                            {!loading && !error && groups.length === 0 && (
                                <EmptyState
                                    icon={<SearchOffRoundedIcon />}
                                    title="No specialists match these filters"
                                    text="Widen the distance or clear a filter. You can also describe your project and let pros come to you."
                                    action={
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                            <Button onClick={handleResetFilters} sx={btn.navy}>Reset filters</Button>
                                            <Button component={RouterLink} href={paths.request.create} sx={btn.outline}>Describe a project</Button>
                                        </Stack>
                                    }
                                />
                            )}

                            {!loading && !error && (
                                <Stack spacing={{ xs: 5, md: 7 }}>
                                    {groups.map((group) => (
                                        <Box component="section" key={group.key} aria-label={group.title}>
                                            {groups.length > 1 && (
                                                <Stack direction="row" alignItems="baseline" flexWrap="wrap" sx={{ columnGap: 1.5, mb: { xs: 1.5, md: 2.5 } }}>
                                                    <Typography component="h2" sx={{ ...cardTitleSx, fontSize: { xs: 18, md: 22 } }}>
                                                        {group.title}
                                                    </Typography>
                                                    {group.hint && (
                                                        <Typography sx={{ color: BRAND.muted, fontSize: 14, fontWeight: 500 }}>
                                                            {group.hint}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            )}
                                            {renderSpecialistCards(group.list)}
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Drawer
                anchor="bottom"
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                sx={{ display: { md: 'none' } }}
                PaperProps={{
                    sx: {
                        maxHeight: '88dvh',
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                    <Typography component="h2" sx={{ ...cardTitleSx, fontSize: 22 }}>Filters</Typography>
                    <IconButton onClick={() => setFiltersOpen(false)} aria-label="Close filters" sx={{ bgcolor: alpha(BRAND.navy, 0.06), borderRadius: '12px', color: BRAND.navy }}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>
                <Box sx={{ px: 2.5, pt: 1.5, pb: 2, overflowY: 'auto', flexGrow: 1 }}>
                    <SpecialistsFilterFields {...filterFieldsProps} showHeader={false} />
                </Box>
                <Stack direction="row" spacing={1.5} sx={{ px: 2.5, py: 2, borderTop: `1px solid ${alpha(BRAND.navy, 0.08)}` }}>
                    <Button onClick={handleResetFilters} sx={{ ...btn.soft, minHeight: 52 }}>Reset</Button>
                    <Button onClick={() => setFiltersOpen(false)} sx={{ ...btn.green, minHeight: 52, flexGrow: 1 }}>
                        {loading ? 'Show specialists' : `Show ${filteredSpecialists.length} ${filteredSpecialists.length === 1 ? 'specialist' : 'specialists'}`}
                    </Button>
                </Stack>
            </Drawer>
        </>
    );
};

export default Page;
