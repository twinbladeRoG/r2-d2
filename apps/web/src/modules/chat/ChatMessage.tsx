import React, { useMemo } from "react";
import { cn } from "../../utils";
import { Accordion, Anchor, Loader, Skeleton, Title } from "@mantine/core";
import Markdown from "marked-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { IMessage } from "../agent-chat/hooks";
import renderer from "../markdown";
import { Link } from "react-router-dom";

export interface IDuckDuckGoToolResult {
  snippet: string;
  title: string;
  link: string;
}

export type IToolResult = {
  name: "duckduckgo_results_json";
  label: string;
  icon: string;
  content: Array<IDuckDuckGoToolResult>;
};

interface SplitMessage {
  content: string | null;
  thought?: string;
  isThinking?: boolean;
}

interface ChatMessageProps extends Omit<IMessage, "role" | "id"> {
  isUser?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  reason,
  isError,
  isLoading,
  isUser,
  isStreaming,
  tools,
  hasInterrupt,
  interruptData,
  citations
}) => {
  // for reasoning model, we split the message into content and thought
  // TODO: implement this as remark/rehype plugin in the future
  const { content, thought, isThinking }: SplitMessage = useMemo(() => {
    if (message === null || isUser) return { content: message };

    let actualContent = "";
    let thought = "";
    let isThinking = false;

    const hasOpeningThinkTag = message.includes("<think>");
    const hasClosingThinkTag = message.includes("</think>");

    let thinkSplit: string[] = [];

    if (hasOpeningThinkTag && hasClosingThinkTag) {
      thinkSplit = message.split("<think>", 2);
      actualContent += thinkSplit[0];
    } else if (hasClosingThinkTag && !hasOpeningThinkTag) {
      thinkSplit = ["", message];
    } else {
      return { content: message };
    }

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

  return (
    <div
      className={cn("p-4 max-w-[80%] rounded-lg", {
        "self-end bg-gray-900": isUser,
        "self-start": !isUser,
        "bg-red-950": isError,
        "min-w-3/4": isLoading,
        "bg-indigo-700": hasInterrupt
      })}>
      {isLoading ? <Skeleton height={40} /> : null}

      {!isLoading && !isUser && (reason || thought) ? (
        <Accordion
          defaultValue={null}
          mb="md"
          classNames={{
            label: "!py-2"
          }}>
          <Accordion.Item value="thought">
            <Accordion.Control icon={<Icon icon="mdi:thought-bubble" />}>
              Thought {isThinking ? <Loader /> : null}
            </Accordion.Control>
            <Accordion.Panel className="">
              {reason ? (
                <Markdown renderer={renderer}>{reason}</Markdown>
              ) : null}
              {thought ? (
                <Markdown renderer={renderer}>{thought}</Markdown>
              ) : null}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      ) : null}

      <Markdown renderer={renderer}>{content}</Markdown>

      {isStreaming && !isUser ? (
        <div className="mt-2">
          <Skeleton height={16} radius="sm" />
          <Skeleton height={16} mt={12} radius="sm" />
          <Skeleton height={16} mt={12} width="70%" radius="sm" />
        </div>
      ) : null}

      {hasInterrupt && interruptData?.message ? (
        <Markdown renderer={renderer}>{interruptData.message}</Markdown>
      ) : null}

      {!isUser && !isLoading && tools !== undefined && tools.length > 0 ? (
        <div className="mt-4">
          {tools?.map((tool, index) => (
            <Accordion
              key={index}
              defaultValue={null}
              mb="md"
              classNames={{
                label: "!py-2"
              }}>
              <Accordion.Item value={tool.name}>
                <Accordion.Control icon={<Icon icon={tool.icon} />}>
                  <Title order={4}>{tool.label}</Title>
                </Accordion.Control>

                <Accordion.Panel
                  classNames={{ content: "flex flex-col gap-3" }}>
                  {tool.content?.map((content, index) => (
                    <div
                      key={index}
                      className="shadow bg-gray-900/40 rounded-xl p-4">
                      <Anchor
                        target="_blank"
                        href={content.link}
                        rel="noreferrer"
                        className="break-words">
                        <Title order={5}>
                          {content.title}{" "}
                          <Icon
                            icon="mdi:external-link"
                            className="inline-block text-xl"
                          />
                        </Title>
                      </Anchor>
                      <p className="text-xs mb-2 text-gray-500">
                        {content.link}
                      </p>
                      <p>{content.snippet}</p>
                    </div>
                  ))}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          ))}
        </div>
      ) : null}

      {citations && citations.length > 0 ? (
        <div className="mt-4">
          <Accordion
            defaultValue={null}
            mt="lg"
            classNames={{ content: "!p-0" }}>
            <Accordion.Item value="citations">
              <Accordion.Control icon={<Icon icon="mdi:book-open" />}>
                Citations
              </Accordion.Control>

              <Accordion.Panel>
                <Accordion defaultValue={null} mt="lg">
                  {citations.map((citation, index) => (
                    <Accordion.Item
                      key={index}
                      value={String(citation.point_id)}>
                      <Accordion.Control>
                        <Anchor
                          component={Link}
                          size="sm"
                          target="_blank"
                          to={`/extraction/${citation.document.id}`}>
                          {citation.document.original_filename}
                        </Anchor>
                        <div className="flex gap-2">
                          <p className="text-xs">
                            Page: <strong>{citation.page_number}</strong>
                          </p>
                          <p className="text-xs">
                            Score: <strong>{citation.score.toFixed(3)}</strong>
                          </p>
                        </div>
                      </Accordion.Control>

                      <Accordion.Panel>
                        <p className="text-sm">{citation.chuck}</p>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
      ) : null}
    </div>
  );
};

export default ChatMessage;
