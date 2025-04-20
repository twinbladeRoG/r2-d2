import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../utils";
import { Divider, ScrollArea, Tabs } from "@mantine/core";
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
import InterruptForm from "./InterruptForm";

interface ChatProps {
  className?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const AgentChat: React.FC<ChatProps> = ({ className }) => {
  const workflow = useAgentWorkflow();
  const navigate = useNavigate();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {
    messages,
    setMessages,
    updateMessage,
    isInterrupted,
    conversationId,
    interruptToolId
  } = useChatMessages();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async (
    message: string,
    hasInterrupt: boolean = false
  ) => {
    const botMessageId = uuid();
    setIsStreaming(true);

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

    await fetchEventSource(`${API_URL}/api/v1/agent/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        conversation_id: conversationId,
        interrupt_response: hasInterrupt
          ? {
              message: message,
              tool_id: interruptToolId
            }
          : undefined
      }),
      signal: ctrl.signal,
      async onopen(response) {
        if (
          response.ok &&
          response.headers.get("content-type") === EventStreamContentType
        ) {
          setActiveNode("__start__");
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
        console.log("CLOSE");
      },
      onmessage(ev) {
        updateMessage(ev, botMessageId, {
          onDone: () => {
            ctrl.abort();
            setActiveNode("__end__");
            setIsStreaming(false);
          },
          onNodeChange: (node: string) => setActiveNode(node)
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
      <div className="flex flex-col overflow-auto">
        <div className="flex w-full">
          <h1 className="font-bold">Agent Chat</h1>
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

            {isInterrupted ? (
              <InterruptForm
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
              <AgentGraph graph={workflow.data.state} activeNode={activeNode} />
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
