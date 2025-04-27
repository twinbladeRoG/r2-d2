import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Textarea } from "@mantine/core";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { cn } from "../../utils";
import { Icon } from "@iconify/react";

interface InterruptFormProps {
  onSubmit: (message: string) => PromiseLike<void>;
}

const schema = yup.object({
  message: yup.string().required("Required")
});

const InterruptForm: React.FC<InterruptFormProps> = ({ onSubmit }) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { message: "Sohan" }
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data.message);
  });

  return (
    <div className={cn("p-4 w-[80%] rounded-lg self-end bg-teal-900")}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Textarea
            {...form.register("message")}
            autosize
            minRows={2}
            maxRows={6}
            error={form.formState.errors.message?.message}
            mb="lg"
          />
          <Button
            type="submit"
            fullWidth
            rightSection={<Icon icon="mdi:send" />}>
            Send
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default InterruptForm;
