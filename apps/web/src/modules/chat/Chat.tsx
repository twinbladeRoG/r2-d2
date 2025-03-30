import React, { useEffect, useState } from "react";
import { cn } from "../../utils";
import ChatInput from "./ChatInput";
import { useChat, useConversation } from "../../apis/queries/chat.queries";
import { ActionIcon, Divider, Drawer, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ConversationHistory from "./ConversationHistory";
import { Icon } from "@iconify/react";
import { IChatMessage, IConversation } from "../../types";
import { v4 as uuid } from "uuid";
import ChatMessage from "./ChatMessage";
interface ChatProps {
  className?: string;
}

interface IMessage {
  id: string;
  role: IChatMessage["role"];
  message: string;
  isLoading?: boolean;
  isError?: boolean;
}

const Chat: React.FC<ChatProps> = ({ className }) => {
  const chat = useChat();

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const handleSubmit = (message: string) => {
    const botMessageId = uuid();

    setMessages((prev) => [
      ...prev,
      {
        id: uuid(),
        role: "user",
        message
      } satisfies IMessage,
      {
        id: botMessageId,
        role: "bot",
        message: "",
        isLoading: true
      }
    ]);

    chat.mutate(
      { message, role: "user", conversation_id: conversationId },
      {
        onSuccess: (res) => {
          if (conversationId == null) {
            setConversationId(res.conversation_id);
          }

          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== botMessageId) return message;

              return {
                id: res.id,
                message: res.message,
                isLoading: false,
                role: "bot"
              } satisfies IMessage;
            })
          );
        },
        onError: (err) => {
          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== botMessageId) return message;

              return {
                ...message,
                isError: true,
                isLoading: false,
                message: err.message
              } satisfies IMessage;
            })
          );
        }
      }
    );
  };

  const [historyOpened, historyHandler] = useDisclosure(false);

  const handleSelectConversation = (value: IConversation) => {
    setSelectedConversationId(value.id);
    historyHandler.close();
  };

  const conversation = useConversation(selectedConversationId);

  useEffect(() => {
    if (conversation.data) {
      setMessages(
        conversation.data.chat_messages.map(
          (message) =>
            ({
              id: message.id,
              message: message.message,
              role: message.role
            }) satisfies IMessage
        )
      );
      setConversationId(conversation.data.id);
    }
  }, [conversation.data]);

  const handleDeleteConversation = (id: string) => {
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
    }
    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
    }
  };

  return (
    <section className={cn(className, "flex flex-col")}>
      <div className="flex w-full">
        <h1 className="font-bold">Chat</h1>

        <ActionIcon
          variant="light"
          size="lg"
          ml="auto"
          onClick={historyHandler.open}>
          <Icon icon="mdi:history" />
        </ActionIcon>
      </div>

      <Divider className="my-3" />

      <ScrollArea.Autosize className="mb-4">
        <div className="flex flex-col gap-y-3">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.message}
              isLoading={message.isLoading}
              isError={message.isError}
              isUser={message.role === "user"}
            />
          ))}
        </div>
      </ScrollArea.Autosize>

      <ChatInput onSubmit={handleSubmit} className="mt-auto" />

      <Drawer
        position="right"
        opened={historyOpened}
        onClose={historyHandler.close}
        title="History">
        <ConversationHistory
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </Drawer>
    </section>
  );
};

export default Chat;
