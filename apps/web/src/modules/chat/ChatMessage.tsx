import React, { useMemo } from "react";
import { cn } from "../../utils";
import { Accordion, Code, Loader, Skeleton } from "@mantine/core";
import Markdown, { ReactRenderer } from "marked-react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ChatMessageProps {
  message: string;
  isLoading?: boolean;
  isUser?: boolean;
  isError?: boolean;
}

interface SplitMessage {
  content: string | null;
  thought?: string;
  isThinking?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isError,
  isLoading,
  isUser
}) => {
  // for reasoning model, we split the message into content and thought
  // TODO: implement this as remark/rehype plugin in the future
  const { content, thought, isThinking }: SplitMessage = useMemo(() => {
    if (message === null || isUser) return { content: message };

    let actualContent = "";
    let thought = "";
    let isThinking = false;
    let thinkSplit = message.split("<think>", 2);
    actualContent += thinkSplit[0];

    while (thinkSplit[1] !== undefined) {
      // <think> tag found
      thinkSplit = thinkSplit[1].split("</think>", 2);
      thought += thinkSplit[0];
      isThinking = true;
      if (thinkSplit[1] !== undefined) {
        // </think> closing tag found
        isThinking = false;
        thinkSplit = thinkSplit[1].split("<think>", 2);
        actualContent += thinkSplit[0];
      }
    }
    return { content: actualContent, thought, isThinking };
  }, [message, isUser]);

  const renderer = useMemo(
    () =>
      ({
        list(children: React.ReactNode, ordered: boolean) {
          if (ordered)
            return (
              <ol className="list-inside my-2 list-decimal">{children}</ol>
            );
          return <ul className="list-inside my-2 list-disc">{children}</ul>;
        },
        code(code: React.ReactNode) {
          return (
            <Code block my="md">
              {code}
            </Code>
          );
        }
      }) satisfies Partial<ReactRenderer>,
    []
  );

  return (
    <div
      className={cn("p-4 max-w-[80%]", {
        "self-end bg-gray-900": isUser,
        "self-start bg-gray-800": !isUser,
        "bg-red-400": isError,
        "min-w-xl": isLoading
      })}>
      {isLoading ? <Skeleton height={40} /> : null}

      {!isLoading && (
        <Accordion defaultValue="thought" mb="md">
          <Accordion.Item value="thought">
            <Accordion.Control icon={<Icon icon="mdi:thought-bubble" />}>
              Thought {isThinking ? <Loader /> : null}
            </Accordion.Control>
            <Accordion.Panel>
              <Markdown renderer={renderer}>{thought}</Markdown>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      <Markdown renderer={renderer}>{content}</Markdown>
    </div>
  );
};

export default ChatMessage;
