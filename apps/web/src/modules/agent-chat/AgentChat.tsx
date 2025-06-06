import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../utils";
import {
  ActionIcon,
  Divider,
  ScrollArea,
  Select,
  Tabs,
  Tooltip
} from "@mantine/core";
import { v4 as uuid } from "uuid";
import ChatInput from "../chat/ChatInput";
import ChatMessage from "../chat/ChatMessage";
import { useAgentWorkflow } from "../../apis/queries/agent.queries";
import {
  EventStreamContentType,
  fetchEventSource
} from "@microsoft/fetch-event-source";
import { getToken } from "../../apis/http";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import Mermaid from "./Mermaid";
import useChatMessages, { IMessage } from "./hooks";
import AgentGraph from "./AgentGraph";
import { ReactFlowProvider } from "@xyflow/react";
import { Icon } from "@iconify/react";
import InterruptForm from "./interrupt";
interface AgentChatProps {
  className?: string;
  agentName: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const AgentChat: React.FC<AgentChatProps> = ({ className, agentName }) => {
  const workflow = useAgentWorkflow(agentName);
  const navigate = useNavigate();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {
    messages,
    setMessages,
    updateMessage,
    isInterrupted,
    setIsInterrupted,
    conversationId,
    setConversationId,
    visitedNodes,
    appendVisitedNode,
    setVisitedNodes,
    interruptData,
    setInterruptData
  } = useChatMessages();
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async (
    message: string,
    hasInterrupt: boolean = false
  ) => {
    const botMessageId = uuid();
    setIsStreaming(true);
    setIsInterrupted(false);
    setInterruptData(null);
    setVisitedNodes([]);

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

    const token = await getToken();

    if (!token) {
      notifications.show({
        color: "red",
        message: "You not authorized for this!"
      });

      navigate("/");
    }

    const ctrl = new AbortController();

    const messageToSent = hasInterrupt
      ? (messages.find((m) => m.role === "user")?.message ?? "Hi")
      : message;

    await fetchEventSource(`${API_URL}/api/v1/agent/${agentName}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        message: messageToSent,
        conversation_id: conversationId,
        interrupt_response: hasInterrupt ? { message: message } : undefined
      }),
      signal: ctrl.signal,
      async onopen(response) {
        if (
          response.ok &&
          response.headers.get("content-type") === EventStreamContentType
        ) {
          appendVisitedNode("__start__");
          return;
        } else if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          notifications.show({
            color: "red",
            message: "Fatal error occurred!"
          });
        } else {
          notifications.show({
            color: "yellow",
            message: "Retry again!"
          });
        }
      },
      onerror(err) {
        setMessages((prev) =>
          prev.map((message) => {
            if (message.id !== botMessageId) return message;

            return {
              ...message,
              id: botMessageId,
              message: err,
              isLoading: false,
              role: "bot"
            } satisfies IMessage;
          })
        );
        ctrl.abort();
      },
      onclose() {
        //
      },
      onmessage(ev) {
        updateMessage(ev, botMessageId, {
          onDone: () => {
            ctrl.abort();
            appendVisitedNode("__end__");
            setIsStreaming(false);
          },
          onNodeChange: (node: string) => {
            appendVisitedNode(node);
          }
        });
      }
    });
  };

  useLayoutEffect(() => {
    scrollRef.current!.scrollTo({
      top: scrollRef.current!.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  return (
    <section className={cn(className, "grid grid-cols-[1fr_380px] gap-4")}>
      <div className="flex flex-col overflow-y-auto w-full">
        <div className="flex items-center gap-4 w-full">
          <h1 className="font-bold">Agent Chat</h1>

          <Select
            size="xs"
            data={[
              { label: "Web Search Agent", value: "web_search_agent" },
              { label: "Human Agent", value: "human_agent" },
              { label: "PowerPoint Agent", value: "power_point_agent" },
              { label: "Excel Agent", value: "excel_agent" }
            ]}
            value={agentName}
            onChange={(value) => {
              setMessages([]);
              setConversationId(null);
              setIsInterrupted(false);
              navigate(`/agent/${value}`);
            }}
          />

          <Tooltip label="New Conversation">
            <ActionIcon
              variant="subtle"
              ml="auto"
              onClick={() => {
                setMessages([]);
                setConversationId(null);
                setIsInterrupted(false);
              }}>
              <Icon icon="mdi:chat-plus" className="text-2xl" />
            </ActionIcon>
          </Tooltip>
        </div>

        <Divider className="my-3" />

        <ScrollArea.Autosize viewportRef={scrollRef} className="mb-4">
          <div className="flex flex-col gap-y-3">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                {...message}
                isUser={message.role === "user"}
              />
            ))}

            {isInterrupted && interruptData ? (
              <InterruptForm
                type={interruptData.type}
                onSubmit={(message) => handleSubmit(message, true)}
              />
            ) : null}
          </div>
        </ScrollArea.Autosize>

        <ChatInput
          onSubmit={handleSubmit}
          className="mt-auto"
          disabled={isStreaming || isInterrupted}
        />
      </div>

      <Tabs
        defaultValue="graph"
        keepMounted={false}
        classNames={{
          root: "!flex !flex-col",
          panel: "!grow h-full flex flex-col"
        }}>
        <Tabs.List>
          <Tabs.Tab value="graph">Graph</Tabs.Tab>
          <Tabs.Tab value="mermaid">Mermaid</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="graph">
          {workflow.data?.state ? (
            <ReactFlowProvider>
              <AgentGraph
                graph={workflow.data.state}
                visitedNodes={visitedNodes}
              />
            </ReactFlowProvider>
          ) : null}
        </Tabs.Panel>

        <Tabs.Panel value="mermaid">
          <div className="border border-amber-400 rounded-2xl bg-amber-50/20 py-7">
            {workflow.data?.mermaid ? (
              <Mermaid>{workflow.data.mermaid}</Mermaid>
            ) : null}
          </div>
        </Tabs.Panel>
      </Tabs>
    </section>
  );
};

export default AgentChat;
