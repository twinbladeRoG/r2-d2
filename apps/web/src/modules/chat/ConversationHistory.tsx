import { ActionIcon, NavLink, Text } from "@mantine/core";
import {
  useConversations,
  useDeleteConversation
} from "../../apis/queries/chat.queries";
import { cn } from "../../utils";
import { IConversation } from "../../types";
import { Icon } from "@iconify/react";
import { useState } from "react";

interface ConversationHistoryProps {
  className?: string;
  onSelectConversation?: (value: IConversation) => void;
  onDeleteConversation?: (id: string) => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  className,
  onSelectConversation,
  onDeleteConversation
}) => {
  const conversations = useConversations(0, 10);

  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      {conversations.data?.length === 0 ? (
        <Text size="md" c="gray.6">
          No conversations found
        </Text>
      ) : null}
      {conversations.data?.map((conversation) => (
        <NavLink
          key={conversation.id}
          p={0}
          component={"div"}
          label={
            <HistoryItem
              conversation={conversation}
              onSelectConversation={() => onSelectConversation?.(conversation)}
              onDeleteConversation={onDeleteConversation}
            />
          }
          className="!truncate"
        />
      ))}
    </div>
  );
};

export default ConversationHistory;

interface HistoryItemProps {
  conversation: IConversation;
  onSelectConversation?: (value: IConversation) => void;
  onDeleteConversation?: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  conversation,
  onSelectConversation,
  onDeleteConversation
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const deleteConversation = useDeleteConversation();

  const handleDelete = () => {
    deleteConversation.mutate(conversation.id, {
      onSuccess: () => {
        onDeleteConversation?.(conversation.id);
      }
    });
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        className="flex-1 text-left px-3 py-2 cursor-pointer"
        onClick={() => onSelectConversation?.(conversation)}>
        {conversation.title}
      </button>

      <div className="flex items-center mx-2 gap-2">
        {showConfirmation ? (
          <>
            <ActionIcon
              variant="light"
              color="gray"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirmation(false);
              }}>
              <Icon icon="mdi:close" />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="green"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirmation(false);
                handleDelete();
              }}>
              <Icon icon="mdi:check" />
            </ActionIcon>
          </>
        ) : (
          <ActionIcon
            variant="light"
            color="red"
            loading={deleteConversation.isPending}
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmation(true);
            }}>
            <Icon icon="mdi:trash" />
          </ActionIcon>
        )}
      </div>
    </div>
  );
};
