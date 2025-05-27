import os
from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import UploadFile
from sqlmodel import Session, delete, select

from api.error import UserDefinedException
from api.models import Document, DocumentBase, User
from api.modules.document_extraction.schemas import ExtractionStatus
from api.modules.knowledge_base.service import KnowledgeBaseService

from .schemas import FileFilterParams

UPLOAD_PATH = Path("uploads")


class FileStorageService:
    @staticmethod
    def _get_local_file_path(username: str, file_name: str):
        """
        Get the file path for a given file name.
        """
        file_path = UPLOAD_PATH / username / file_name

        return file_path

    async def upload_file(self, session: Session, user: User, file: UploadFile):
        file_name = file.filename.split(".")[0]
        file_extension = file.filename.split(".")[-1]
        new_file_name = f"{file_name.replace(' ', '_')}_{uuid4().hex}.{file_extension}"

        file_path = self._get_local_file_path(user.username, new_file_name)
        dir_path = file_path.parent

        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(file_path, "wb") as saved_file:
            content = await file.read()
            await saved_file.write(content)
            await file.close()
            await saved_file.close()

            document = DocumentBase(
                filename=new_file_name,
                original_filename=file.filename,
                content_type=file.content_type,
                content_length=len(content),
                extraction_status=ExtractionStatus.PENDING,
            )

            document = Document.model_validate(document, update={"owner_id": user.id})
            session.add(document)
            session.commit()
            session.refresh(document)

            return document

    def get_file(self, user: User, session: Session, file_id: str):
        statement = select(Document).where(Document.id == file_id)
        document = session.exec(statement).one()

        if document is None:
            raise UserDefinedException(
                "Document not found",
                "DOCUMENT_NOT_FOUND",
            )

        if document.owner_id != user.id:
            raise UserDefinedException(
                "You don't have permission to remove this file",
                "DOCUMENT_PERMISSION",
            )

        return document

    def get_file_path(self, user: User, session: Session, file_id: str):
        document = self.get_file(user, session, file_id)

        file_path = self._get_local_file_path(user.username, document.filename)

        if not file_path.exists():
            raise UserDefinedException(
                "Document does not exists",
                "DOCUMENT_DOES_NOT_EXISTS",
            )

        return file_path

    def get_user_files(
        self, session: Session, user: User, query: FileFilterParams
    ) -> list[Document]:
        statement = select(Document).where(Document.owner_id == user.id)

        if query.search:
            statement = statement.where(
                Document.original_filename.ilike(f"%{query.search}%")
            )
        if query.extraction_status:
            statement = statement.where(
                Document.extraction_status == query.extraction_status
            )
        if query.exclude:
            statement = statement.where(Document.id.not_in(query.exclude))
        if query.file_types:
            statement = statement.where(Document.content_type.in_(query.file_types))

        results = session.exec(statement)

        return results

    def remove_file(
        self,
        session: Session,
        user: User,
        knowledge_base_service: KnowledgeBaseService,
        file_id: str,
    ):
        statement = select(Document).where(Document.id == file_id)
        document = session.exec(statement).one()

        if document is None:
            raise UserDefinedException(
                "Document not found",
                "DOCUMENT_NOT_FOUND",
            )

        if document.owner_id != user.id:
            raise UserDefinedException(
                "You don't have permission to remove this file",
                "DOCUMENT_PERMISSION",
            )

        file_path = UPLOAD_PATH / user.username / document.filename

        if not file_path.exists():
            raise UserDefinedException(
                "Document does not exists",
                "DOCUMENT_DOES_NOT_EXISTS",
            )

        os.remove(file_path)

        knowledge_base_service.remove_document_from_vector_store(document_id=file_id)

        remove_statement = delete(Document).where(Document.id == file_id)
        session.exec(remove_statement)
        session.commit()

    def update_job_id(self, session: Session, user: User, file_id: str, job_id: str):
        document = self.get_file(user, session, file_id)

        document.job_id = job_id
        session.add(document)
        session.commit()
        session.refresh(document)

        return document
