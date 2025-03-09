from docling.document_converter import DocumentConverter


class DocumentExtractor:
    def __init__(self):
        pass

    def extract_document(self, file_name: str):
        converter = DocumentConverter()
        source = f"uploads/{file_name}"
        result = converter.convert(source)  # noqa: F841

        return {"message": "Get all documents"}
