import PropTypes from 'prop-types';
import { Box, Button, SvgIcon } from '@mui/material';
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import { blueGrey } from "@mui/material/colors";
import { useCallback, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../../libs/firebase";
import toast from "react-hot-toast";
import { profileApi } from "../../../../api/profile";

export const SpecialistCover = (props) => {
    const { profile, ...other } = props;
    const [cover, setCover] = useState(profile.cover || "/assets/covers/abstract-1-4x3-large.png");

    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleCoverChange = useCallback(async (e) => {
        try {
            if (e.target.files) {
                const file = e.target.files[0];

                const storageRef = ref(storage, '/cover/' + profile.id + '-' + file.name);
                uploadBytes(storageRef, file).then((snapshot) => {
                    getDownloadURL(storageRef).then(async (url) => {
                        setCover(url);

                        await profileApi.update(profile.id, {
                            cover: url
                        });
                        toast.success("Cover upload successfully!");
                    })
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');

        }
    }, [setCover, profile]);

    return (
        <Box
            style={{ backgroundImage: `url(${cover})` }}
            sx={{
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                borderRadius: 1,
                height: 348,
                position: 'relative',
                '&:hover': {
                    '& button': {
                        visibility: 'visible'
                    }
                }
            }}
        >
            <Button
                startIcon={(
                    <SvgIcon>
                        <Image01Icon />
                    </SvgIcon>
                )}
                sx={{
                    backgroundColor: blueGrey[900],
                    bottom: {
                        lg: 24,
                        xs: 'auto'
                    },
                    color: 'common.white',
                    position: 'absolute',
                    right: 24,
                    top: {
                        lg: 'auto',
                        xs: 24
                    },
                    visibility: 'hidden',
                    '&:hover': {
                        backgroundColor: blueGrey[900]
                    }
                }}
                variant="contained"
                onClick={handleAttach}
            >
                Change Cover
            </Button>
            <input
                hidden
                ref={fileInputRef}
                type="file"
                onChange={handleCoverChange}
            />
        </Box>
    );
};

SpecialistCover.propTypes = {
    profile: PropTypes.object,
};
