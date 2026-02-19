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

function loadImageAsDataURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = url;
    });
}

function downloadStringAsFile(data, filename) {
    let a = document.createElement('a');
    a.download = filename;
    a.href = data;
    a.click();
}

export const SpecialistQRBusinessCard = (props) => {
    const {
        user,
        userSpecialties,
        url,
        onClose,
        open = false,
    } = props;
    const svgRef = useRef(null);

    async function onSVGButtonClick() {
        try {
            const svgNode = svgRef.current;
            if (!svgNode) return;

            const avatarURL = user?.avatar || "/assets/logo.png";
            const avatarBase64 = await loadImageAsDataURL(avatarURL);

            const svgClone = svgNode.cloneNode(true);
            const imgNode = svgClone.querySelector("image");
            if (imgNode) imgNode.setAttribute("href", avatarBase64);

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgClone);

            const svgBlob = new Blob([svgString], {
                type: "image/svg+xml;charset=utf-8"
            });

            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0);

                URL.revokeObjectURL(url);

                canvas.toBlob((blob) => {
                    downloadStringAsFile(
                        URL.createObjectURL(blob),
                        `${user?.businessName || 'Specialist'}_QR.png`
                    );
                }, "image/png");
            };

            img.src = url;

        } catch (e) {
            console.error(e);
            toast.error("QR code download error!");
        }
    }
    const filteredUserSpecialties = (userSpecialties || []).filter((spc) => spc && spc.accepted);

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
                    image={user?.cover || '/assets/covers/minimal-1-4x4-small.png'}
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
                                src: user?.avatar || '/assets/logo.png',
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
                        {user?.businessName || 'Specialist'}
                    </Link>
                    <Typography
                        align="center"
                        variant="body2"
                        color="text.secondary"
                    >
                        {user?.phone || 'No phone number'}
                    </Typography>
                    <Typography
                        align="center"
                        variant="body2"
                        color="text.secondary"
                    >
                        {user?.email || 'No email'}
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