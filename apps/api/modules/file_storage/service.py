from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import UploadFile
from sqlmodel import Session, select

from api.models import Document, DocumentBase, User

UPLOAD_PATH = Path("uploads")


class FileStorageService:
    async def upload_file(self, session: Session, user: User, file: UploadFile):
        file_name = file.filename.split(".")[0]
        file_extension = file.filename.split(".")[-1]
        new_file_name = f"{file_name}_{uuid4().hex}.{file_extension}"
        file_path = UPLOAD_PATH / user.username / new_file_name
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
            )

            document = Document.model_validate(document, update={"owner_id": user.id})
            session.add(document)
            session.commit()
            session.refresh(document)

            return document

    def get_user_files(self, session: Session, user: User) -> list[Document]:
        statement = select(Document).where(Document.owner_id == user.id)
        results = session.exec(statement)
        return results
