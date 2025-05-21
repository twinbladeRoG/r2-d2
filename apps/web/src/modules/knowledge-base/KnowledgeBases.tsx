import { useState } from "react";
import { useKnowledgeBases } from "../../apis/queries/knowledge-base.queries";
import KnowledgeBaseCard from "./KnowledgeBaseCard";
import KnowledgeBaseDetails from "./KnowledgeBaseDetails";
import { Divider } from "@mantine/core";

const KnowledgeBases = () => {
  const knowledgeBases = useKnowledgeBases();

  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<
    string | null
  >(null);

  return (
    <div>
      <div className="flex mb-4 gap-4 flex-wrap justify-evenly">
        {knowledgeBases.data?.map((item) => (
          <KnowledgeBaseCard
            knowledgeBase={item}
            key={item.id}
            onClick={(value) => setSelectedKnowledgeBaseId(value.id)}
          />
        ))}
      </div>

      <Divider my="lg" />

      {selectedKnowledgeBaseId ? (
        <KnowledgeBaseDetails knowledgeBaseId={selectedKnowledgeBaseId} />
      ) : null}
    </div>
  );
};

export default KnowledgeBases;
