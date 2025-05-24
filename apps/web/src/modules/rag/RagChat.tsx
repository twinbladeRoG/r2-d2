import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../utils";
import { Divider, ScrollArea, Select } from "@mantine/core";
import ChatInput from "../chat/ChatInput";
import { v4 as uuid } from "uuid";
import { useDocumentChat } from "../../apis/queries/document-chat.queries";
import { notifications } from "@mantine/notifications";
import ChatMessage from "../chat/ChatMessage";
import { IMessage } from "../agent-chat/hooks";
import { useKnowledgeBases } from "../../apis/queries/knowledge-base.queries";
import { useSearchParams } from "react-router-dom";

interface RagChatProps {
  className?: string;
}

const RagChat: React.FC<RagChatProps> = ({ className }) => {
  const chat = useDocumentChat();
  const knowledgeBases = useKnowledgeBases();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const knowledgeBaseId = useMemo(() => searchParams.get("id"), [searchParams]);

  useLayoutEffect(() => {
    scrollRef.current!.scrollTo({
      top: scrollRef.current!.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const handleSubmit = (message: string) => {
    if (knowledgeBaseId == null) {
      notifications.show({
        message: "Please select a knowledge base to chat with.",
        title: "Knowledge Base Required",
        color: "yellow"
      });

      return;
    }

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
      {
        message,
        role: "user",
        conversation_id: conversationId,
        knowledge_base_id: String(knowledgeBaseId)
      },
      {
        onSuccess: ({ chat_message, citations }) => {
          if (conversationId == null) {
            setConversationId(chat_message.conversation_id);
          }

          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== botMessageId) return message;

              return {
                id: chat_message.id,
                message: chat_message.message,
                isLoading: false,
                role: "bot",
                citations: citations
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

  return (
    <section className={cn(className, "flex flex-col")}>
      <div className="flex w-full gap-4 items-center">
        <h1 className="font-bold">RAG</h1>

        <Select
          searchable
          data={knowledgeBases.data?.map((knowledgeBase) => ({
            value: knowledgeBase.id,
            label: knowledgeBase.name
          }))}
          size="xs"
          placeholder="Select Knowledge Base"
          value={knowledgeBaseId}
          onChange={(value) => {
            if (value !== null)
              setSearchParams({ id: value }, { replace: true });
          }}
        />
      </div>

      <Divider className="my-3" />

      <ScrollArea.Autosize className="mb-4" viewportRef={scrollRef}>
        <div className="flex flex-col gap-y-3">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.message}
              isLoading={message.isLoading}
              isError={message.isError}
              isUser={message.role === "user"}
              citations={message.citations}
            />
          ))}
        </div>
      </ScrollArea.Autosize>

      <ChatInput onSubmit={handleSubmit} className="mt-auto" />
    </section>
  );
};

export default RagChat;
