import PropTypes from 'prop-types';
import {Avatar, Box, Container, Link, Stack, Typography, useMediaQuery} from '@mui/material';
import {Seo} from './seo';

export const Ava = (props) => {
    const {avatar, title, subtitle, children} = props;

    if (!title && !subtitle) {
        return <Avatar
            src={avatar}
            sx={{
                height: 32,
                width: 32
            }}
        >
            {children}
        </Avatar>
    }

    return (
        <Stack
            alignItems="center"
            direction="row"
            spacing={1}
        >

            <Avatar
                src={avatar}
                sx={{
                    height: 32,
                    width: 32
                }}
            >
                {children}
            </Avatar>

            <div>
                {title &&
                    <Typography
                        color="text.primary"
                        variant="subtitle2"
                    >
                        {title}
                    </Typography>
                }
                {subtitle &&
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        {subtitle}
                    </Typography>
                }
            </div>
        </Stack>
    );
};

Ava.propTypes = {
    avatar: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    children: PropTypes.node
};
