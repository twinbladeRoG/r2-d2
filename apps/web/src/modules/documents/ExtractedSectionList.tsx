import React from "react";
import { IExtractedSection } from "../../types";
import { Card, Divider, Text } from "@mantine/core";
import Markdown from "marked-react";
import renderer from "../markdown";

interface ExtractedSectionListProps {
  sections?: Array<IExtractedSection>;
  className?: string;
}

const ExtractedSectionList: React.FC<ExtractedSectionListProps> = ({
  sections,
  className
}) => {
  return (
    <div className={className}>
      {sections
        ?.sort((x, y) => x.page_number - y.page_number)
        ?.map((item) => (
          <Card
            mb="lg"
            key={item.id}
            bg={item?.type === "table" ? "dark.9" : "gray.9"}>
            <div>
              <Markdown breaks renderer={renderer}>
                {item.content}
              </Markdown>
            </div>

            <Divider my="md" />

            <Text size="sm" c="gray.6">
              Page Number: {item.page_number}
            </Text>
          </Card>
        ))}
    </div>
  );
};

export default ExtractedSectionList;
