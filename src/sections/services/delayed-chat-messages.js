import {Stack} from "@mui/material";
import { useEffect, useState } from 'react';
import './TypingAnimation.css';
import {FindChatMessage} from "src/sections/services/find-chat-message";

const DelayedChatMessages = ({ chatMessages }) => {
    const [visibleMessages, setVisibleMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        chatMessages.reduce((delaySum, message, index) => {
            setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                    setVisibleMessages((prevMessages) => [...prevMessages, message]);
                    setIsTyping(false);
                }, 1000);
            }, delaySum);
            return delaySum + (message.delay || 2000);
        }, 0);
    }, [chatMessages]);

    return (
        <Stack spacing={2} sx={{ p: 3 }}>
            {visibleMessages.map((message) => (
                <div className="fade-in" key={message.id}>
                    <FindChatMessage
                        previousSame={message.previousSame}
                        authorAvatar={"/assets/logo.png"}
                        authorName={"CTMASS helper"}
                        body={message.body}
                        contentType={message.contentType}
                        createdAt={new Date()}
                        position={message.user ? 'right' : 'left'}
                        event={message.event}
                    />
                </div>
            ))}
            {isTyping && <div className="typing-animation"><span>.</span><span>.</span><span>.</span></div>}
        </Stack>
    );
};

export default DelayedChatMessages;
