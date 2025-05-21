import React from "react";
import { IKnowledgeBase } from "../../types";
import { Icon } from "@iconify/react";
import { cn } from "../../utils";
import { ActionIcon, Divider, LoadingOverlay, Menu } from "@mantine/core";
import { useDeleteKnowledgeBase } from "../../apis/queries/knowledge-base.queries";

interface KnowledgeBaseCardProps {
  knowledgeBase: IKnowledgeBase;
  onClick?: (knowledgeBase: IKnowledgeBase) => void;
}

const KnowledgeBaseCard: React.FC<KnowledgeBaseCardProps> = ({
  knowledgeBase,
  onClick
}) => {
  const deleteKnowledgeBase = useDeleteKnowledgeBase();

  const handleDelete = () => {
    deleteKnowledgeBase.mutate(knowledgeBase.id, {});
  };

  return (
    <button
      onClick={() => onClick?.(knowledgeBase)}
      className={cn(
        "relative bg-purple-600 rounded-lg cursor-pointer w-32 flex flex-col",
        "hover:bg-purple-800 focus:bg-purple-800 transition-colors duration-200"
      )}>
      <div className="p-2 self-center">
        <Icon icon="hugeicons:ai-book" className="text-8xl" />
      </div>
      <Divider color="violet.0" className="my-1" />

      <div className="flex justify-between items-center flex-1">
        <p
          className="font-bold px-4 pb-1 whitespace-nowrap overflow-hidden text-ellipsis"
          title={knowledgeBase.name}>
          {knowledgeBase.name}
        </p>

        <Menu
          shadow="md"
          position="bottom-end"
          width={100}
          trigger="hover"
          openDelay={100}
          closeDelay={400}>
          <Menu.Target>
            <ActionIcon component="div" color="violet" variant="transparent">
              <Icon icon="mdi:dots-vertical" className="text-2xl" />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<Icon icon="mdi:trash" />}
              color="red"
              onClick={handleDelete}
              disabled={deleteKnowledgeBase.isPending}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      <LoadingOverlay
        visible={deleteKnowledgeBase.isPending}
        zIndex={100}
        overlayProps={{ radius: "md", blur: 2 }}
      />
    </button>
  );
};

export default KnowledgeBaseCard;
