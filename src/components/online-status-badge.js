import { Badge, styled } from "@mui/material";
import * as React from "react";
import PropTypes from "prop-types";
import { useOnlineStatus } from "src/contexts/online-status-context";

// Стили для анимации ripple
const RippleBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        backgroundColor: "#44b700", // Цвет значка
        color: "#44b700", // Цвет обводки
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        "&::after": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            animation: "ripple 1.2s infinite ease-in-out",
            border: "1px solid currentColor",
            content: '""',
        },
    },
    "@keyframes ripple": {
        "0%": {
            transform: "scale(.8)",
            opacity: 1,
        },
        "100%": {
            transform: "scale(2.4)",
            opacity: 0,
        },
    },
}));

export const OnlineStatusBadge = (props) => {
    const { userId, children } = props;
    const { onlineUsers } = useOnlineStatus();

    return (
        <RippleBadge
            variant="dot"
            overlap="circular"
            invisible={!onlineUsers[userId]}
            color="success"
        >
            {children}
        </RippleBadge>
    );
};

OnlineStatusBadge.propTypes = {
    userId: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};