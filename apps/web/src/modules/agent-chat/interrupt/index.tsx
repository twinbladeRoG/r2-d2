import React from "react";
import NameInterruptForm from "./NameInterruptForm";
import ExcelFileSelectForm from "./ExcelFileSelectForm";

interface InterruptFormProps {
  type: string;
  onSubmit: (value: string) => PromiseLike<void>;
}

const InterruptForm: React.FC<InterruptFormProps> = ({ type, onSubmit }) => {
  switch (type) {
    case "SELECT_NAME":
      return <NameInterruptForm onSubmit={onSubmit} />;
    case "SELECT_EXCEL_FILE":
      return <ExcelFileSelectForm onSubmit={onSubmit} />;
    default:
      return null;
  }
};

export default InterruptForm;
