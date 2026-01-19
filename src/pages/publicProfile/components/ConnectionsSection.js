import { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    ButtonBase,
    CircularProgress,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate } from 'react-router-dom';
import { profileApi } from 'src/api/profile';

const CATEGORY_CONFIG = [
    {
        id: 'trustedColleagues',
        title: 'Trusted colleagues',
        description: 'Professionals they trust and collaborate with most often.',
        categories: ['trustedColleagues']
    },
    {
        id: 'localPros',
        title: 'Local pros',
        description: 'Specialists working in nearby areas.',
        categories: ['localPros']
    },
    {
        id: 'clientsInterested',
        title: 'Past clients & Interested homeowners',
        description: 'Homeowners they have worked with or who are interested in future collaborations.',
        categories: ['pastClients', 'interestedHomeowners']
    }
];

const getPublicProfilePath = (profile) => {
    if (!profile) {
        return '#';
    }
    const slug = profile.profilePage || profile.id || '';
    return `/contractors/first1000/${slug}`;
};

const getPrimarySpecialty = (profile, specialtyLookup) => {
    if (!profile) {
        return '';
    }

    const specialties = profile.specialties;

    if (Array.isArray(specialties) && specialties.length) {
        const first = specialties[0];
        if (typeof first === 'string') {
            return specialtyLookup[first]?.label || specialtyLookup[first] || '';
        }
        if (first?.specialty) {
            const lookup = specialtyLookup[first.specialty];
            if (lookup?.label) {
                return lookup.label;
            }
            if (typeof lookup === 'string') {
                return lookup;
            }
            return first.label || '';
        }
        if (first?.label) {
            return first.label;
        }
    }

    if (profile.mainSpecId && specialtyLookup[profile.mainSpecId]) {
        const value = specialtyLookup[profile.mainSpecId];
        return value?.label || value;
    }

    if (profile.professionalRole) {
        return profile.professionalRole;
    }

    if (profile.role === 'HOMEOWNER') {
        return 'Homeowner';
    }

    return '';
};

const ConnectionsSection = ({ profileId, specialtyLookup }) => {
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState({
        trustedColleagues: [],
        localPros: [],
        pastClients: [],
        interestedHomeowners: []
    });
    const [profilesById, setProfilesById] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        const loadConnections = async () => {
            if (!profileId) {
                setConnections({
                    trustedColleagues: [],
                    localPros: [],
                    pastClients: [],
                    interestedHomeowners: []
                });
                setProfilesById({});
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const [rawConnections, friendIds] = await Promise.all([
                    profileApi.getConnections(profileId),
                    profileApi.getConfirmedFriends(profileId)
                ]);

                const confirmedSet = new Set(friendIds || []);

                const normalizedIds = {
                    trustedColleagues: (rawConnections?.trustedColleagues || []).filter((id) => confirmedSet.has(id)),
                    localPros: (rawConnections?.localPros || []).filter((id) => confirmedSet.has(id)),
                    pastClients: (rawConnections?.pastClients || []).filter((id) => confirmedSet.has(id)),
                    interestedHomeowners: (rawConnections?.interestedHomeowners || []).filter((id) => confirmedSet.has(id))
                };

                const uniqueIds = Array.from(
                    new Set(
                        Object.values(normalizedIds)
                            .flat()
                            .filter(Boolean)
                    )
                );

                let profilesMap = {};
                if (uniqueIds.length) {
                    const profileList = await profileApi.getProfilesById(uniqueIds);
                    profilesMap = profileList.reduce((acc, item) => {
                        acc[item.id] = item;
                        return acc;
                    }, {});
                }

                if (!active) {
                    return;
                }

                setConnections(normalizedIds);
                setProfilesById(profilesMap);
            } catch (error) {
                console.error(error);
                if (active) {
                    setConnections({
                        trustedColleagues: [],
                        localPros: [],
                        pastClients: [],
                        interestedHomeowners: []
                    });
                    setProfilesById({});
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadConnections();

        return () => {
            active = false;
        };
    }, [profileId]);

    const sections = useMemo(
        () =>
            CATEGORY_CONFIG.map((config) => {
                const ids = config.categories.flatMap((categoryKey) => connections[categoryKey] || []);
                const unique = Array.from(new Set(ids));
                const items = unique
                    .map((id) => profilesById[id])
                    .filter(Boolean);

                return {
                    ...config,
                    items
                };
            }),
        [connections, profilesById]
    );

    const hasAnyConnections = sections.some((section) => section.items.length > 0);

    const handleProfileOpen = useCallback(
        (person) => {
            if (!person?.id) {
                return;
            }

            navigate(getPublicProfilePath(person));
        },
        [navigate]
    );

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <GroupsIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Connections &amp; Friends
                    </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    A professional&apos;s network helps you understand their reliability and reputation within the platform.
                </Typography>

                {loading ? (
                    <Stack alignItems="center" spacing={2} py={6}>
                        <CircularProgress size={28} />
                        <Typography variant="body2" color="text.secondary">
                            Loading connections…
                        </Typography>
                    </Stack>
                ) : hasAnyConnections ? (
                    <Stack spacing={3.5}>
                        {sections.map((section) => {
                            if (!section.items.length) {
                                return null;
                            }

                            return (
                                <Stack key={section.id} spacing={1.5}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {section.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {section.description}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gap: 2,
                                            gridTemplateColumns: {
                                                xs: 'repeat(2, minmax(0, 1fr))',
                                                sm: 'repeat(3, minmax(0, 1fr))',
                                                md: 'repeat(4, minmax(0, 1fr))'
                                            }
                                        }}
                                    >
                                        {section.items.slice(0, 12).map((person) => {
                                            const name =
                                                person.businessName ||
                                                person.displayName ||
                                                person.name ||
                                                person.email ||
                                                'Member';

                                            const specialty = getPrimarySpecialty(person, specialtyLookup);

                                            return (
                                                <ButtonBase
                                                    key={`${section.id}-${person.id}`}
                                                    onClick={() => handleProfileOpen(person)}
                                                    sx={{
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        gap: 1,
                                                        p: 2,
                                                        borderRadius: 2,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        transition: 'all 0.2s ease',
                                                        backgroundColor: 'background.paper',
                                                        '&:hover': {
                                                            borderColor: 'primary.main',
                                                            boxShadow: (theme) => theme.shadows[2],
                                                            textDecoration: 'none'
                                                        }
                                                    }}
                                                >
                                                    <Avatar
                                                        src={person.avatar || undefined}
                                                        alt={name}
                                                        sx={{
                                                            width: 64,
                                                            height: 64,
                                                            mb: 1
                                                        }}
                                                    />
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {specialty || (person.role === 'HOMEOWNER' ? 'Homeowner' : 'Member')}
                                                    </Typography>
                                                </ButtonBase>
                                            );
                                        })}
                                    </Box>
                                </Stack>
                            );
                        })}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Connections have not been published yet.
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};

ConnectionsSection.propTypes = {
    profileId: PropTypes.string,
    specialtyLookup: PropTypes.object
};

ConnectionsSection.defaultProps = {
    profileId: '',
    specialtyLookup: {}
};

export default ConnectionsSection;