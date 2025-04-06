from fastapi import APIRouter

from api.dependencies import CurrentUser, FileStorageServiceDep, SessionDep
from api.modules.kafka.dependencies import KafkaProducerDep

from .dependencies import DocumentExtractorDep

router = APIRouter(prefix="/document-extraction", tags=["Document Extraction"])


@router.post("/{file_id}")
def extract_document(
    session: SessionDep,
    user: CurrentUser,
    document_extraction_service: DocumentExtractorDep,
    file_storage_service: FileStorageServiceDep,
    file_id: str,
):
    document = file_storage_service.get_file(user, session, file_id)
    file_path = file_storage_service.get_file_path(user, session, file_id)
    result = document_extraction_service.extract_document(
        session, user, document, file_path
    )
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
