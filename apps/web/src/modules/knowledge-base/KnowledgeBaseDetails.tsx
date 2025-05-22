import React from "react";
import { useKnowledgeBase } from "../../apis/queries/knowledge-base.queries";
import { Card, Divider, Skeleton, Title } from "@mantine/core";
import KnowledgeBaseDocuments from "./KnowledgeBaseDocuments";

interface KnowledgeBaseDetailsProps {
  knowledgeBaseId: string;
}
const KnowledgeBaseDetails: React.FC<KnowledgeBaseDetailsProps> = ({
  knowledgeBaseId
}) => {
  const knowledgeBase = useKnowledgeBase(knowledgeBaseId);

  if (knowledgeBase.isLoading) {
    return <Skeleton h={25} w={"100%"} radius="md" animate={true} mb="xs" />;
  }

  return (
    <>
      <Card mb="lg">
        <Title order={3} mb="xs">
          {knowledgeBase.data?.name}
        </Title>
        <Divider mb="xs" />
        <p>
          Vector Store: <strong>{knowledgeBase.data?.vector_store_name}</strong>
        </p>
        <p>
          Documents:{" "}
          <strong>{knowledgeBase.data?.documents.length ?? 0}</strong>
        </p>
      </Card>

      <Card>
        <KnowledgeBaseDocuments
          documents={knowledgeBase.data?.documents ?? []}
          knowledgeBaseId={knowledgeBaseId}
        />
      </Card>
    </>
  );
};

export default KnowledgeBaseDetails;
