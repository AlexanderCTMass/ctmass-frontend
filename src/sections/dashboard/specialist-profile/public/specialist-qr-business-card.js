import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Dialog,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Typography
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useRef } from "react";
import Download01Icon from "@untitled-ui/icons-react/build/esm/Download01";
import CloseIcon from '@mui/icons-material/Close';
import toast from "react-hot-toast";

export const SpecialistQRBusinessCard = (props) => {
    const {
        user,
        userSpecialties,
        url,
        onClose,
        open = false,
    } = props;
    const svgRef = useRef(null);

    function downloadStringAsFile(data, filename) {
        let a = document.createElement('a');
        a.download = filename;
        a.href = data;
        a.click();
    }

    function onSVGButtonClick() {
        try {
            const node = svgRef.current;
            if (node == null) {
                return;
            }
            // For SVG, we need to get the markup and turn it into XML.
            // Using XMLSerializer is the easiest way to ensure the markup
            // contains the xmlns. Then we make sure it gets the right DOCTYPE,
            // encode all of that to be safe to be encoded as a URI (which we
            // need to stuff into href).
            const serializer = new XMLSerializer();
            const fileURI =
                'data:image/svg+xml;charset=utf-8,' +
                encodeURIComponent(
                    '<?xml version="1.0" standalone="no"?>' +
                    serializer.serializeToString(node)
                );

            downloadStringAsFile(fileURI, user?.businessName + '_QR.svg');
        } catch (e) {
            console.error(e);
            toast.error('QR code error download!');
        }
    }
    const filteredUserSpecialties = userSpecialties.filter((spc) => spc && spc.accepted);

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            onClose={onClose}
            open={open}
            scroll={"body"}
        >
            <Card sx={{ height: '100%' }}>
                <CardMedia
                    image={user.cover || '/assets/covers/minimal-1-4x4-small.png'}
                    sx={{ height: 200 }}
                />
                <CardContent sx={{ pt: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 2,
                            mt: '-128px'
                        }}
                    >
                        <QRCodeSVG
                            marginSize={1}
                            ref={svgRef}
                            value={`${url}?connect=1`}
                            title={"CTMASS Specialist profile"}
                            size={256}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"Q"}
                            imageSettings={{
                                src: user.avatar || '/assets/logo.png',
                                x: undefined,
                                y: undefined,
                                height: 80,
                                width: 80,
                                opacity: 1,
                                excavate: true
                            }}
                        />
                    </Box>

                    <Link
                        align="center"
                        color="text.primary"
                        sx={{ display: 'block' }}
                        underline="none"
                        variant="h6"
                    >
                        {user.businessName}
                    </Link>
                    <Typography
                        align="center"
                        variant="body2"
                        color="text.secondary"
                    >
                        {user.phone}
                    </Typography>
                    <Typography
                        align="center"
                        variant="body2"
                        color="text.secondary"
                    >
                        {user.email}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack
                        alignItems="center"
                        direction="row"
                        flexWrap="wrap"
                        gap={0.5}
                    >
                        {filteredUserSpecialties.map((spec) => {
                            if (spec) return (
                                <Chip
                                    key={spec.label}
                                    label={spec.label}
                                    sx={{ m: 0.5 }}
                                    variant="outlined"
                                />
                            )
                        })}
                    </Stack>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'center' }}>
                    <Button
                        onClick={onSVGButtonClick}
                        color="inherit"
                        size="small"
                        startIcon={(
                            <SvgIcon>
                                <Download01Icon />
                            </SvgIcon>
                        )}
                    >
                        Download QR
                    </Button>
                    <Button
                        onClick={onClose}
                        color="inherit"
                        size="small"
                        startIcon={(
                            <SvgIcon>
                                <CloseIcon />
                            </SvgIcon>
                        )}
                    >
                        Close
                    </Button>
                </CardActions>
            </Card>
        </Dialog>
    );
};