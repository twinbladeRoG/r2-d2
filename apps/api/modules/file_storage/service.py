import aiofiles
from fastapi import UploadFile

UPLOAD_PATH = "uploads"


class FileStorageService:
    def __init__(self):
        pass

    async def upload_file(self, file: UploadFile):
        file_path = UPLOAD_PATH / file.filename

        async with aiofiles.open(file_path, "wb") as saved_file:
            content = await file.read()
            await saved_file.write(content)
            await file.close()
            await saved_file.close()

            return {
                "message": "File uploaded",
                "filename": file.filename,
                "content_type": file.content_type,
            }
