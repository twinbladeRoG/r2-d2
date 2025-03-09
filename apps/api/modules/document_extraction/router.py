from fastapi import APIRouter

router = APIRouter(prefix="/document-extraction", tags=["Document Extraction"])


@router.post("/{file_name}")
def extract_document(file_name: str):
    return {"message": "Get all documents"}
