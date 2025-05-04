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
  hasInterrupt?: true;
  interruptMessage?: string;
}

const useChatMessages = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);

  const appendVisitedNode = (node: string) => {
    setVisitedNodes((previousNodes) => {
      const lastVisitedNode = previousNodes[previousNodes.length - 1];
      if (lastVisitedNode === node) return previousNodes;
      return [...previousNodes, node];
    });
  };

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

        case "interrupt": {
          try {
            const data = JSON.parse(message.data) as {
              query: string;
              message: string;
            };

            setMessages((prev) =>
              prev.map((message) => {
                if (message.id !== botMessageId) return message;

                return {
                  ...message,
                  id: botMessageId,
                  message: "",
                  isLoading: false,
                  isStreaming: true,
                  isError: false,
                  hasInterrupt: true,
                  interruptMessage: data.message
                } satisfies IMessage;
              })
            );

            setIsInterrupted(true);

            options?.onDone?.();
          } catch (err) {
            setMessages((prev) =>
              prev.map((message) => {
                if (message.id !== botMessageId) return message;

                return {
                  ...message,
                  id: botMessageId,
                  message: (err as Error).message,
                  isLoading: false,
                  isStreaming: true,
                  isError: false
                } satisfies IMessage;
              })
            );
          }

          break;
        }

        case "conversationId": {
          const id = message.data;
          setConversationId(id);
          break;
        }

        case "error": {
          const data = message.data as string;

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

  return {
    messages,
    setMessages,
    updateMessage,
    isInterrupted,
    setIsInterrupted,
    conversationId,
    setConversationId,
    visitedNodes,
    appendVisitedNode,
    setVisitedNodes
  } as const;
};

export default useChatMessages;
