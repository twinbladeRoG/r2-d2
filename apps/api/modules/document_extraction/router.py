from fastapi import APIRouter, Depends

from api.dependencies import CurrentUser, FileStorageServiceDep, SessionDep
from api.modules.kafka.dependencies import KafkaProducerDep

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


@router.post("/{file_id}/schedule")
async def schedule_extraction(
    session: SessionDep,
    document_extraction_service: DocumentExtractorDep,
    user: CurrentUser,
    file_storage_service: FileStorageServiceDep,
    producer: KafkaProducerDep,
    file_id: str,
):
    file = file_storage_service.get_file(user, session, file_id)
    await document_extraction_service.schedule_extraction(producer, user, file.id)
    return None
