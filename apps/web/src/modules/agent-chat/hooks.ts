import { useCallback, useState } from "react";
import { IChatMessage } from "../../types";
import { IToolResult } from "../chat/ChatMessage";
import { EventSourceMessage } from "@microsoft/fetch-event-source";

export interface IMessage {
  id: string;
  role: IChatMessage["role"];
  message: string;
  reason?: string;
  isLoading?: boolean;
  isError?: boolean;
  isStreaming?: boolean;
  tools?: Array<IToolResult>;
}

const useChatMessages = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const updateMessage = useCallback(
    (
      message: EventSourceMessage,
      botMessageId: string,
      options:
        | {
            onDone?: () => void;
            onNodeChange?: (node: string) => void;
          }
        | undefined
    ) => {
      switch (message.event) {
        case "done": {
          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== botMessageId) return message;

              return {
                ...message,
                isStreaming: false
              } satisfies IMessage;
            })
          );

          options?.onDone?.();
          break;
        }

        case "message": {
          const data = JSON.parse(message.data) as { text: string };

          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== botMessageId) return message;

              return {
                ...message,
                id: botMessageId,
                message: data.text,
                isLoading: false,
                role: "bot",
                isStreaming: true
              } satisfies IMessage;
            })
          );
          break;
        }

        case "reason": {
          const data = JSON.parse(message.data) as { text: string };

          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== botMessageId) return message;

              return {
                ...message,
                id: botMessageId,
                reason: data.text,
                isLoading: false,
                role: "bot",
                isStreaming: true
              } satisfies IMessage;
            })
          );

          break;
        }

        case "tool": {
          const data = JSON.parse(message.data) as IToolResult;

          switch (data.name) {
            case "duckduckgo_results_json": {
              setMessages((prev) =>
                prev.map((message) => {
                  if (message.id !== botMessageId) return message;

                  return {
                    ...message,
                    message: "",
                    tools: [
                      ...(message.tools ?? []),
                      {
                        name: "duckduckgo_results_json",
                        content: data.content,
                        label: data.label,
                        icon: data.icon
                      } satisfies IToolResult
                    ]
                  } satisfies IMessage;
                })
              );

              break;
            }
            default:
              break;
          }

          break;
        }

        case "node": {
          const data = message.data as string;
          options?.onNodeChange?.(data);
          break;
        }

        case "error": {
          const data = message.data as string;
          console.log("ERR", data);

          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== botMessageId) return message;

              return {
                ...message,
                id: botMessageId,
                message: data,
                isLoading: false,
                isStreaming: true,
                isError: true
              } satisfies IMessage;
            })
          );
          break;
        }
      }
    },
    []
  );

  return [messages, setMessages, updateMessage] as const;
};

export default useChatMessages;
