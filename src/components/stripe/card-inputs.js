import { Box, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

// Полный список фонов и иконок для всех поддерживаемых платежных систем
const brandAssets = {
    amex: {
        bg: '/assets/cards/card-mastercard-2.png',
        icon: '/assets/logos/logo-amex.png'
    },
    diners: {
        bg: '/assets/cards/card-mastercard-2.png',
        icon: '/assets/logos/logo-diners.png'
    },
    discover: {
        bg: '/assets/cards/card-mastercard-2.png',
        icon: '/assets/logos/logo-discover.png'
    },
    jcb: {
        bg: '/assets/cards/card-mastercard-2.png',
        icon: '/assets/logos/logo-jcb.png'
    },
    mastercard: {
        bg: '/assets/cards/card-mastercard-1.png',
        icon: '/assets/logos/logo-mastercard.svg'
    },
    unionpay: {
        bg: '/assets/cards/card-mastercard-2.png',
        icon: '/assets/logos/logo-unionpay.png'
    },
    visa: {
        bg: '/assets/cards/card-visa.png',
        icon: '/assets/logos/logo-visa.svg'
    },
    // Fallback для неизвестных карт
    unknown: {
        bg: '/assets/cards/card-mastercard-2.png',
        icon: '/assets/logos/logo-card.png'
    }
};

const CardContainer = styled(Box)(({ theme, brand = 'visa' }) => {
    const assets = brandAssets[brand] || brandAssets.unknown;

    return {
        backgroundColor: theme.palette.primary.main,
        backgroundImage: `url("${assets.bg}")`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        borderRadius: theme.shape.borderRadius * 2,
        padding: theme.spacing(4),
        position: 'relative',
        overflow: 'hidden',
        boxShadow: theme.shadows[3],
        transition: 'all 0.3s ease',
    };
});

const CardForm = styled(Box)({
    position: 'relative',
    zIndex: 1,
});

const StyledCardElement = styled(Box)(({ theme, focused }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${focused ? theme.palette.common.white : 'rgba(255, 255, 255, 0.3)'}`,
    padding: theme.spacing(1.5),
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:hover': {
        borderColor: focused ? theme.palette.common.white : 'rgba(255, 255, 255, 0.5)',
    },
}));

const CardInput = () => {
    const theme = useTheme();
    const elements = useElements();
    const [focusedField, setFocusedField] = useState(null);
    const [cardBrand, setCardBrand] = useState(null);

    useEffect(() => {
        const cardNumberElement = elements?.getElement(CardNumberElement);
        if (!cardNumberElement) return;

        const handleChange = (event) => {
            if (event.complete && !event.error) {
                elements.getElement(CardExpiryElement).focus();
            }
            // Нормализуем название бренда для наших assets
            const brand = event.brand ? event.brand.toLowerCase() : 'unknown';
            setCardBrand(brandAssets[brand] ? brand : 'unknown');
        };

        cardNumberElement.on('change', handleChange);
        return () => {
            cardNumberElement.off('change', handleChange);
        };
    }, [elements]);

    const handleFocus = (field) => () => {
        setFocusedField(field);
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    const currentAssets = brandAssets[cardBrand] || brandAssets.unknown;

    return (
        <CardContainer brand={cardBrand}>
            {/* Верхняя часть карты с логотипами */}
            <Box sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                mb: 4
            }}>
                <img
                    src="/assets/contactless.svg"
                    alt="contactless"
                    width={24}
                    height={24}
                />
                <Box sx={{
                    height: 32,
                    '& img': {
                        height: '100%',
                        width: 'auto'
                    }
                }}>
                    <img
                        alt={cardBrand}
                        src={currentAssets.icon}
                    />
                </Box>
            </Box>

            {/* Форма ввода данных */}
            <CardForm>
                {/* Поле номера карты */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        color="white"
                        variant="body2"
                        sx={{ mb: 1, opacity: 0.8 }}
                    >
                        Card number
                    </Typography>
                    <StyledCardElement focused={focusedField === 'number'}>
                        <CardNumberElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '24px',
                                        color: theme.palette.common.white,
                                        fontFamily: theme.typography.fontFamily,
                                        fontWeight: 700,
                                        letterSpacing: '0.1em',
                                        '::placeholder': {
                                            color: 'rgba(255, 255, 255, 0.5)',
                                        },
                                    },
                                    invalid: {
                                        color: theme.palette.error.light,
                                    },
                                },
                                showIcon: false, // Мы используем свои иконки
                                placeholder: '4242 4242 4242 4242',
                            }}
                            onReady={(el) => {
                                el.on('focus', handleFocus('number'));
                                el.on('blur', handleBlur);
                            }}
                        />
                    </StyledCardElement>
                </Box>

                {/* Нижняя строка с датой, CVC и SIM */}
                <Box sx={{ display: 'flex', gap: 3 }}>
                    {/* Поле срока действия */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            color="white"
                            variant="body2"
                            sx={{ mb: 1, opacity: 0.8 }}
                        >
                            Expiry date
                        </Typography>
                        <StyledCardElement focused={focusedField === 'expiry'}>
                            <CardExpiryElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: theme.palette.common.white,
                                            fontFamily: theme.typography.fontFamily,
                                            fontWeight: 700,
                                            '::placeholder': {
                                                color: 'rgba(255, 255, 255, 0.5)',
                                            },
                                        },
                                    },
                                    placeholder: 'MM/YY',
                                }}
                                onReady={(el) => {
                                    el.on('focus', handleFocus('expiry'));
                                    el.on('blur', handleBlur);
                                    el.on('change', (event) => {
                                        if (event.complete && !event.error) {
                                            elements.getElement(CardCvcElement).focus();
                                        }
                                    });
                                }}
                            />
                        </StyledCardElement>
                    </Box>

                    {/* Поле CVC */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            color="white"
                            variant="body2"
                            sx={{ mb: 1, opacity: 0.8 }}
                        >
                            CVC
                        </Typography>
                        <StyledCardElement focused={focusedField === 'cvc'}>
                            <CardCvcElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: theme.palette.common.white,
                                            fontFamily: theme.typography.fontFamily,
                                            fontWeight: 700,
                                            '::placeholder': {
                                                color: 'rgba(255, 255, 255, 0.5)',
                                            },
                                        },
                                    },
                                    placeholder: '•••',
                                }}
                                onReady={(el) => {
                                    el.on('focus', handleFocus('cvc'));
                                    el.on('blur', handleBlur);
                                }}
                            />
                        </StyledCardElement>
                    </Box>

                    {/* Иконка SIM-карты */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <img
                            src="/assets/sim.svg"
                            alt="sim card"
                            width={32}
                            height={24}
                        />
                    </Box>
                </Box>
            </CardForm>
        </CardContainer>
    );
};

export default CardInput;