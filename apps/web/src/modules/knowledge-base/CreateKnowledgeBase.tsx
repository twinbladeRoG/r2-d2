import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Modal, Textarea, TextInput } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { useCreateKnowledgeBase } from "../../apis/queries/knowledge-base.queries";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  name: yup.string().trim().required("Required"),
  description: yup.string().trim().optional()
});

interface CreateKnowledgeBaseProps {
  opened: boolean;
  onClose: () => void;
  selectedDocumentIds?: string[];
}

const CreateKnowledgeBase: React.FC<CreateKnowledgeBaseProps> = ({
  opened,
  onClose,
  selectedDocumentIds
}) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", description: undefined }
  });

  const createKnowledgeBase = useCreateKnowledgeBase();

  const navigate = useNavigate();

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!selectedDocumentIds || selectedDocumentIds.length === 0) {
      notifications.show({
        color: "red",
        message: "Please select at least one document."
      });
      return;
    }

    createKnowledgeBase.mutate(
      {
        name: data.name,
        description: data.description,
        documents: selectedDocumentIds
      },
      {
        onSuccess: () => {
          notifications.show({
            color: "green",
            message: "Knowledge base created!"
          });
          form.reset();
          onClose();
          navigate("/knowledge-base");
        }
      }
    );
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Knowledge Base"
      centered>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Knowledge Base Name"
            required
            {...form.register("name")}
            error={form.formState.errors.name?.message}
            mb="lg"
          />

          <Textarea
            label="Description"
            {...form.register("description")}
            error={form.formState.errors.description?.message}
            mb="lg"
          />

          <p className="mb-4 text-sm">
            Selected Documents:{" "}
            <strong>{selectedDocumentIds?.length ?? 0}</strong>
          </p>

          <Button
            fullWidth
            type="submit"
            loading={createKnowledgeBase.isPending}>
            Create
          </Button>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default CreateKnowledgeBase;
