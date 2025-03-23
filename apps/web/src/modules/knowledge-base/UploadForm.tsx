import { Button, Card, Text } from "@mantine/core";
import DropFileInput from "../shared/form/DropFileInput";
import { FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object({
  files: yup
    .array()
    .of(
      yup.mixed().test({
        test: (value) => {
          const file = value as FileWithPath;
          const validTypes: string[] = [MIME_TYPES.pdf, MIME_TYPES.docx];
          return validTypes.includes(file.type);
        },
        message: "Only PDF and DOCX files are allowed",
        name: "is-valid-file-type"
      })
    )
    .min(1, "At least one file should be uploaded")
});

const UploadForm = () => {
  const form = useForm<yup.InferType<typeof schema>>({
    resolver: yupResolver(schema),
    defaultValues: {
      files: []
    }
  });

  const handleSubmit = form.handleSubmit((data) => {
    console.log("Files", data.files);
  });

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Controller
          control={form.control}
          name="files"
          render={({ field, fieldState }) => (
            <DropFileInput
              accept={[MIME_TYPES.pdf, MIME_TYPES.docx]}
              mb={"lg"}
              onDrop={field.onChange}
              error={fieldState.error?.message}>
              <div>
                <Text size="xl" inline>
                  Upload files to Knowledge Base
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  Only PDF and DOCX files are allowed.
                </Text>
              </div>
            </DropFileInput>
          )}
        />

        <Button fullWidth type="submit">
          Upload
        </Button>
      </form>
    </Card>
  );
};

export default UploadForm;
