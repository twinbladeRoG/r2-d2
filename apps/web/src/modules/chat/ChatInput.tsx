import { ActionIcon, Textarea } from "@mantine/core";
import React from "react";
import { cn } from "../../utils";
import { Icon } from "@iconify/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

interface ChatInputProps {
  className?: string;
  onSubmit?: (message: string) => void;
  disabled?: boolean;
}

const schema = yup.object({
  message: yup.string().required("Required")
});

const ChatInput: React.FC<ChatInputProps> = ({
  className,
  onSubmit,
  disabled
}) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      message: ""
    }
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit?.(data.message);
    form.reset();
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      className={cn(
        className,
        "bg-slate-950 p-4 shadow rounded-xl flex gap-x-3 items-start"
      )}
      onSubmit={handleSubmit}>
      <Textarea
        className="flex-1"
        {...form.register("message")}
        error={form.formState.errors.message?.message}
        autosize
        minRows={2}
        maxRows={6}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Ask anything"
      />

      <ActionIcon size="xl" type="submit" disabled={disabled}>
        <Icon icon="mdi:send" className="text-2xl" />
      </ActionIcon>
    </form>
  );
};

export default ChatInput;
