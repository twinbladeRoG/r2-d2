from fastapi import APIRouter

router = APIRouter(prefix="/document-extraction", tags=["Document Extraction"])


@router.get("/")
def get_all_documents():
    return {"message": "Get all documents"}
