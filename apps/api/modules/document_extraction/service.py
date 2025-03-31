from pathlib import Path

from docling.document_converter import DocumentConverter
from sqlmodel import Session

from api.models import User

from .docling_extractor import DoclingExtractor


class DocumentExtractorService:
    def __init__(self):
        self.converter = DoclingExtractor()

    def extract_document(self, session: Session, user: User, file_path: Path):
        result = self.converter.run(file_path)

        return result
