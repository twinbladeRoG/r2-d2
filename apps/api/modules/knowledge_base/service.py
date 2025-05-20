from uuid import uuid4

from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    VectorParams,
)

from api.core.config import settings
from api.error import UserDefinedException
from api.logger import logger
from api.models import Document

COLLECTION_NAME = "knowledge_base"


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

    def _initialize_vector_collection(self, collection_name: str):
        try:
            self.vector_store.get_collection(collection_name=collection_name)
            logger.info(f"Collection {collection_name} already exists.")
        except UnexpectedResponse:
            logger.info(f"Collection {collection_name} does not exist. Creating it.")
            self.vector_store.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
            )
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            raise UserDefinedException(
                f"Unable to create qdrant collection {e}", "QDRANT_CREATE"
            )

    def create_embeddings(self, input: str | list[str]):
        embeddings = self.openai.embeddings.create(
            input=input,
            model="bge-large-en-v1.5_fp32.gguf",
            encoding_format="float",
        )
        return embeddings

    def store_to_vector_store(self, document: Document):
        chunks: list[tuple[int, str]] = []

        for section in document.extracted_sections:
            section_chunks = self._split_text_to_chunks(section.content, 512)
            chunks.extend([(section.page_number, chunk) for chunk in section_chunks])

        embeddings = self.create_embeddings(input=[chunk[1] for chunk in chunks])

        self._initialize_vector_collection(COLLECTION_NAME)

        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings.data)):
            self.vector_store.upload_points(
                collection_name=COLLECTION_NAME,
                points=[
                    PointStruct(
                        id=uuid4().hex,
                        vector=embedding.embedding,
                        payload={
                            "page_number": chunk[0],
                            "text": chunk[1],
                            "document_id": document.id,
                        },
                    )
                ],
            )

        collection = self.vector_store.get_collection(collection_name=COLLECTION_NAME)

        return collection.points_count

    def search_from_vector_store(self, document_id: str, query: str):
        logger.debug(
            f"Searching in vector store for document_id: {document_id} with query: {query}"
        )

        query_embedding = self.create_embeddings(query)

        results = self.vector_store.search(
            collection_name=COLLECTION_NAME,
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
