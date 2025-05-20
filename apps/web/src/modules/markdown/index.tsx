import { Anchor, Code, Divider, Table, Title } from "@mantine/core";
import { ReactRenderer } from "marked-react";
import React from "react";

const renderer = {
  list(children: React.ReactNode, ordered: boolean) {
    if (ordered)
      return <ol className="list-inside my-2 list-decimal">{children}</ol>;
    return <ul className="list-inside my-2 list-disc">{children}</ul>;
  },
  code(code: React.ReactNode) {
    return (
      <Code block my="md">
        {code}
      </Code>
    );
  },
  table(children) {
    return (
      <Table withTableBorder withColumnBorders>
        {children}
      </Table>
    );
  },
  tableBody(children) {
    return <Table.Tbody>{children}</Table.Tbody>;
  },
  tableHeader(children) {
    return <Table.Thead>{children}</Table.Thead>;
  },
  tableRow(children) {
    return <Table.Tr>{children}</Table.Tr>;
  },
  tableCell(children) {
    return <Table.Td>{children}</Table.Td>;
  },
  heading(children, level) {
    return <Title order={level}>{children}</Title>;
  },
  link(href, text) {
    return (
      <Anchor href={href} target="_blank">
        {text}
      </Anchor>
    );
  },
  hr() {
    return <Divider my="lg" />;
  }
} satisfies Partial<ReactRenderer>;

export default renderer;
