import { useMemo } from "react";
import { useKnowledgeBases } from "../../apis/queries/knowledge-base.queries";
import KnowledgeBaseCard from "./KnowledgeBaseCard";
import KnowledgeBaseDetails from "./KnowledgeBaseDetails";
import { Divider } from "@mantine/core";
import { useSearchParams } from "react-router-dom";

const KnowledgeBases = () => {
  const knowledgeBases = useKnowledgeBases();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedKnowledgeBaseId = useMemo(
    () => searchParams.get("id"),
    [searchParams]
  );

  return (
    <div>
      <div className="flex mb-4 gap-4 flex-wrap justify-evenly">
        {knowledgeBases.data?.map((item) => (
          <KnowledgeBaseCard
            knowledgeBase={item}
            key={item.id}
            onClick={(value) =>
              setSearchParams({ id: value.id }, { replace: true })
            }
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
