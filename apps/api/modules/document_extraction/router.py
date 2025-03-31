from fastapi import APIRouter

from api.dependencies import CurrentUser, FileStorageServiceDep, SessionDep

from .dependencies import DocumentExtractorDep
from .schemas import ExtractionResult

router = APIRouter(prefix="/document-extraction", tags=["Document Extraction"])


@router.post("/{file_id}", response_model=ExtractionResult)
def extract_document(
    session: SessionDep,
    user: CurrentUser,
    document_extraction_service: DocumentExtractorDep,
    file_storage_service: FileStorageServiceDep,
    file_id: str,
):
    file_path = file_storage_service.get_file_path(user, session, file_id)
    result = document_extraction_service.extract_document(session, user, file_path)
    return result
