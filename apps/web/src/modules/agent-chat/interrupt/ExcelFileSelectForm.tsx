import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Select } from "@mantine/core";
import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { cn } from "../../../utils";
import { Icon } from "@iconify/react";
import { useUserFiles } from "../../../apis/queries/file-storage.queries";
import { MIME_TYPES } from "@mantine/dropzone";

interface ExcelFileSelectFormProps {
  onSubmit: (message: string) => PromiseLike<void>;
}

const schema = yup.object({
  fileId: yup.string().required("Required")
});

const ExcelFileSelectForm: React.FC<ExcelFileSelectFormProps> = ({
  onSubmit
}) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { fileId: undefined }
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data.fileId);
  });

  const documents = useUserFiles({
    file_types: [MIME_TYPES.csv, MIME_TYPES.xlsx]
  });

  return (
    <div className={cn("p-4 w-[80%] rounded-lg self-end bg-teal-900")}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Controller
            control={form.control}
            name="fileId"
            render={({ field, fieldState }) => (
              <Select
                required
                value={field.value}
                onChange={field.onChange}
                name={field.name}
                label="Select File to Process"
                data={documents.data?.map((doc) => ({
                  value: doc.id,
                  label: doc.original_filename
                }))}
                error={fieldState.error?.message}
                mb="lg"
              />
            )}
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

export default ExcelFileSelectForm;
