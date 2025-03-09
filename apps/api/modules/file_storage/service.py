import aiofiles
from fastapi import UploadFile


class FileStorageService:
    def __init__(self):
        pass

    async def upload_file(self, file: UploadFile):
        file_path = f"uploads/{file.filename}"
        async with aiofiles.open(file_path, "wb") as saved_file:
            content = await file.read()
            await saved_file.write(content)

            return {
                "message": "File uploaded",
                "filename": file.filename,
                "content_type": file.content_type,
            }
