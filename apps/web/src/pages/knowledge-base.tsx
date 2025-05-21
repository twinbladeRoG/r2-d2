import { Divider, Title } from "@mantine/core";
import KnowledgeBases from "../modules/knowledge-base/KnowledgeBases";

const KnowledgeBasePage = () => {
  return (
    <section>
      <Title order={2}>Knowledge Base</Title>

      <Divider my="lg" />

      <KnowledgeBases />
    </section>
  );
};

export default KnowledgeBasePage;
