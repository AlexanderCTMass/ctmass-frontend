import { Box, Divider, Stack } from "@mui/material";
import React, { useState } from "react";
import { Scrollbar } from "src/components/scrollbar";
import { ChatMessageAdd } from "src/sections/dashboard/chat/chat-message-add";
import DelayedChatMessages from "src/sections/services/delayed-chat-messages";

export const FindSpecialistChatForm = (props) => {
  const { ...other } = props;
  const [chatMessages, setChatMessages] = useState([
    {
      body: `Приветствуем на платформе CTMASS! ` +
        `Очень рады, что Вы заинтересовались проектом! Чем Вам помочь?`,
      contentType: "text",
      user: false,
      previousSame: false,
      delay: 300
    },
    {
      body: `Чем Вам помочь?`,
      contentType: "text",
      user: false,
      previousSame: true,
      delay: 500
    },
    {
      body: `Создать заявку на услугу: Water heater setup`,
      contentType: "button",
      event: () => {
        handleChatMessageChange("Создать заявку на услугу: Water heater setup")
      },
      user: true,
      delay: 1
    },
    {
      body: `Посмотреть всех специалистов по услуге: Water heater setup`,
      contentType: "button",
      event: () => {
        // handleTabChange({}, 1)
      },
      user: true,
      delay: 1
    },
    {
      body: `Рассказать подробнее про сайт`,
      contentType: "button",
      user: true,
      delay: 1
    }
  ]);

  const handleChatMessageChange = (newMessage) => {
    setChatMessages((prevState) => {
      return [{
        body: newMessage,
        contentType: "text",
        user: true,
        previousSame: false,
        delay: 0
      },]
    });
  };

  return (
    <Stack
      sx={{
        flexGrow: 1,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden'
        }}
      >
        <Scrollbar
          // ref={messagesRef}
          sx={{ maxHeight: '100%' }}
        >
          <DelayedChatMessages chatMessages={chatMessages} />
        </Scrollbar>
      </Box>
      <Divider />
      <ChatMessageAdd onSend={() => {
      }} />
    </Stack>
  );
};
