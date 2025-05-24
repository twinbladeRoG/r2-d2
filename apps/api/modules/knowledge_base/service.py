from __future__ import annotations

import re
from typing import TYPE_CHECKING

from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    VectorParams,
)
from sqlmodel import Session, delete, or_, select

from api.core.config import settings
from api.error import UserDefinedException
from api.logger import logger
from api.models import Document, KnowledgeBase, User

from .schemas import KnowledgeBaseCreate

if TYPE_CHECKING:
    from api.modules.file_storage.service import FileStorageService


class KnowledgeBaseService:
    def __init__(self):
        self.openai = OpenAI(
            base_url=f"{settings.EMBEDDING_MODEL_HOST}/v1",
            api_key=settings.EMBEDDING_MODEL_SECRET,
        )
        self.vector_store = QdrantClient(url="http://localhost:6333")

    def _split_text_to_chunks(self, text: str, chunk_size: int = 512) -> list[str]:
        """
        Splits the text into chunks of a specified size.
        """
        return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]

    def _initialize_vector_collection(
        self, collection_name: str, raise_if_not_found: bool = False
    ):
        collection_exists = self.vector_store.collection_exists(
            collection_name=collection_name
        )

        if collection_exists == True:
            logger.info(f"Collection '{collection_name}' already exists.")
        else:
            logger.info(f"Collection '{collection_name}' does not exist. Creating it.")

            if raise_if_not_found:
                raise UserDefinedException(
                    "Collection does not exists", "COLLECTION_DOES_NOT_EXISTS"
                )

            self.vector_store.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
            )

    def create_embeddings(self, input: str | list[str]):
        embeddings = self.openai.embeddings.create(
            input=input,
            model="bge-large-en-v1.5_fp32.gguf",
            encoding_format="float",
        )
        return embeddings

    def search_from_vector_store(
        self, collection_name: str, document_id: str, query: str
    ):
        logger.debug(
            f"Searching in vector store for document_id: {document_id} with query: {query}"
        )

        query_embedding = self.create_embeddings(query)

        results = self.vector_store.search(
            collection_name=collection_name,
            query_vector=query_embedding.data[0].embedding,
            limit=5,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="document_id", match=MatchValue(value=document_id)
                    )
                ]
            ),
        )

        logger.debug(
            f"Search results retrieved for document_id: {document_id} is {len(results)} for query: {query}"
        )

        return results

    def get_count_of_points_from_collection(
        self, document_id: str, collection_name: str
    ):
        self._initialize_vector_collection(collection_name, True)

        results = self.vector_store.count(
            collection_name=collection_name,
            count_filter=Filter(
                must=[
                    FieldCondition(
                        key="document_id", match=MatchValue(value=document_id)
                    )
                ]
            ),
        )

        logger.debug(
            f'Found {results} points for collection: "{collection_name}" for document: {document_id}'
        )

        return results.count

    def remove_document_from_vector_store(self, document_id: str, collection_name: str):
        count = self.get_count_of_points_from_collection(document_id, collection_name)

        if count == 0:
            return

        result = self.vector_store.delete(
            collection_name=collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="document_id", match=MatchValue(value=document_id)
                    )
                ]
            ),
        )

        logger.debug(
            f'Removed points for collection: "{collection_name}" for document: {document_id}, with status: "{result.status}"'
        )

        return result.status

    def slugify_name(self, name: str):
        return re.sub(r"\s+", "_", name.strip().lower())

    def _check_if_knowledge_base_exists(self, session: Session, name: str):
        statement = select(KnowledgeBase).where(
            or_(
                KnowledgeBase.name == name,
                KnowledgeBase.vector_store_name == self.slugify_name(name),
            )
        )
        knowledge_base = session.exec(statement).first()

        if knowledge_base is None:
            return False

        return True

    def create_knowledge_base(
        self,
        session: Session,
        user: User,
        file_service: FileStorageService,
        payload: KnowledgeBaseCreate,
    ):
        does_knowledge_base_exists = self._check_if_knowledge_base_exists(
            session, payload.name
        )

        if does_knowledge_base_exists:
            raise UserDefinedException(
                f"A knowledge base already exists with name: {payload.name}",
                "ALREADY_EXISTS",
            )

        knowledge_base = KnowledgeBase(
            name=payload.name,
            vector_store_name=self.slugify_name(payload.name),
        )

        self._initialize_vector_collection(
            collection_name=knowledge_base.vector_store_name
        )

        session.add(knowledge_base)
        session.commit()
        session.refresh(knowledge_base)

        documents: list[Document] = []

        for documentId in payload.documents:
            logger.debug(
                f"Adding document: {documentId} to knowledge base: {knowledge_base.id}"
            )

            try:
                document = file_service.get_file(user, session, documentId)
                documents.append(document)
            except UserDefinedException as e:
                logger.error(
                    f"Error getting document: {documentId} for knowledge base: {knowledge_base.id}, error: {e}"
                )
            except Exception as e:
                logger.error(
                    f"Error getting document: {documentId} for knowledge base: {knowledge_base.id}, error: {e}"
                )

        knowledge_base.documents = documents

        session.add(knowledge_base)
        session.commit()
        session.refresh(knowledge_base)

        return knowledge_base

    def get_knowledge_bases(self, session: Session, user: User):
        statement = select(KnowledgeBase)
        knowledge_bases = session.exec(statement).all()

        return knowledge_bases

    def get_knowledge_base_by_id(self, session: Session, user: User, id: str):
        statement = select(KnowledgeBase).where(KnowledgeBase.id == id)
        knowledge_base = session.exec(statement).one()

        if knowledge_base is None:
            raise UserDefinedException(
                f"No knowledge base found with id: {id}", "NOT_FOUND"
            )

        return knowledge_base

    def delete_knowledge_base(self, session: Session, user: User, id: str):
        knowledge_base = self.get_knowledge_base_by_id(session, user, id)

        try:
            logger.debug(
                f"Deleting vector store collection: {knowledge_base.vector_store_name}"
            )

            self.vector_store.delete_collection(
                collection_name=knowledge_base.vector_store_name
            )

        except Exception as e:
            logger.error(
                f"Error deleting vector store collection: {knowledge_base.vector_store_name}, error: {e}"
            )
            raise UserDefinedException(
                f"Error deleting vector store collection: {knowledge_base.vector_store_name}",
                "VECTOR_STORE_DELETION_ERROR",
            )

        statement = delete(KnowledgeBase).where(KnowledgeBase.id == id)
        session.exec(statement)
        session.commit()

        logger.debug(
            f"Knowledge base with id: {id} deleted successfully. Vector store removed."
        )

        return knowledge_base

    def add_document_to_knowledge_base(
        self,
        session: Session,
        user: User,
        file_service: FileStorageService,
        knowledge_base_id: str,
        document_ids: list[str],
    ):
        knowledge_base = self.get_knowledge_base_by_id(session, user, knowledge_base_id)

        for document_id in document_ids:
            document = file_service.get_file(user, session, document_id)

            if document in knowledge_base.documents:
                raise UserDefinedException(
                    f"Document with id: {document_id} already exists in knowledge base: {knowledge_base_id}",
                    "DOCUMENT_ALREADY_EXISTS",
                )

            knowledge_base.documents.append(document)

        session.commit()

        logger.debug(
            f"{len(document_ids)} documents added to knowledge base: {knowledge_base_id}"
        )

        return knowledge_base

    def remove_document_from_knowledge_base(
        self,
        session: Session,
        user: User,
        file_service: FileStorageService,
        knowledge_base_id: str,
        document_id: str,
    ):
        knowledge_base = self.get_knowledge_base_by_id(session, user, knowledge_base_id)

        document = file_service.get_file(user, session, document_id)

        if document not in knowledge_base.documents:
            raise UserDefinedException(
                f"Document with id: {document_id} is not part of knowledge base: {knowledge_base_id}",
                "DOCUMENT_NOT_IN_KNOWLEDGE_BASE",
            )

        knowledge_base.documents.remove(document)
        session.commit()

        logger.debug(
            f"Document with id: {document_id} removed from knowledge base: {knowledge_base_id}"
        )

        return knowledge_base
