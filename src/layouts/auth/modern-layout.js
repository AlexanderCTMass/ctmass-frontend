import PropTypes from 'prop-types';
import {Box, Chip, Stack, Typography} from '@mui/material';
import {Logo} from 'src/components/logo';
import {LogoSamsung} from 'src/components/logos/logo-samsung';
import {LogoVisma} from 'src/components/logos/logo-visma';
import {LogoBolt} from 'src/components/logos/logo-bolt';
import {LogoAws} from 'src/components/logos/logo-aws';
import {LogoAccenture} from 'src/components/logos/logo-accenture';
import {LogoAtt} from 'src/components/logos/logo-att';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';

export const Layout = (props) => {
    const {children} = props;

    let videos = ["guitar", "woman", "phone", "cleaning"];
    let video = videos[Math.floor(Math.random() * videos.length)];
    return (
        <Box
            sx={{
                backgroundColor: 'background.default',
                display: 'flex',
                flex: '1 1 auto',
                flexDirection: {
                    xs: 'column-reverse',
                    md: 'row'
                }
            }}
        >
            <Box
                sx={{
                    alignItems: 'center',
                    backgroundColor: 'neutral.800',
                    color: 'common.white',
                    display: 'flex',
                    flex: {
                        xs: '0 0 auto',
                        md: '1 1 auto'
                    },
                    justifyContent: 'center',
                    p: {
                        xs: 4,
                        md: 8
                    },
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Video */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Затемнение 60%
                            zIndex: 1
                        }
                    }}
                >
                    <Box
                        component="video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.8 // Дополнительное уменьшение яркости
                        }}
                    >
                        <source src={`/assets/video/${video}.mp4`} type="video/mp4"/>
                    </Box>
                </Box>

                {/* Content with higher z-index */}
                <Box
                    maxWidth="md"
                    sx={{
                        position: 'relative',
                        zIndex: 2, // Увеличиваем z-index чтобы текст был поверх затемнения
                        width: '100%'
                    }}
                >
                    <Typography
                        sx={{mb: 1}}
                        variant="h1"
                    >
                        Welcome to CTMASS
                    </Typography>
                    <Typography
                        variant="h3"
                        sx={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)' // Добавляем тень тексту
                        }}
                    >
                        Help people.<br/>
                        Earn on what you know how to do best.
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    flex: {
                        xs: '1 1 auto',
                        md: '0 0 auto'
                    },
                    flexDirection: 'column',
                    justifyContent: {
                        md: 'center'
                    },
                    maxWidth: '100%',
                    p: {
                        xs: 4,
                        md: 8
                    },
                    width: {
                        md: 600
                    }
                }}
            >
                <div>
                    <Box sx={{mb: 4}}>
                        <Stack
                            alignItems="center"
                            component={RouterLink}
                            direction="row"
                            display="inline-flex"
                            href={paths.index}
                            spacing={1}
                            sx={{textDecoration: 'none'}}
                        >
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    height: 56,
                                    width: 56
                                }}
                            >
                                <Logo/>
                            </Box>
                            <Box
                                sx={{
                                    color: 'text.primary',
                                    fontFamily: '\'Plus Jakarta Sans\', sans-serif',
                                    fontSize: 14,
                                    fontWeight: 800,
                                    letterSpacing: '0.3px',
                                    lineHeight: 2.5,
                                    '& span': {
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                CT<span>MASS</span>.com
                            </Box>
                        </Stack>
                    </Box>
                    {children}
                </div>
            </Box>
        </Box>
    );
};

Layout.propTypes = {
    children: PropTypes.node
};
