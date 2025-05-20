from openai import OpenAI
from sqlmodel import Session, select

from api.core.config import settings
from api.models import ChatMessage, Conversation, User
from api.modules.file_storage.service import FileStorageService
from api.modules.knowledge_base.service import KnowledgeBaseService

from .schemas import ChatMessageWithCitations, Citation, DocumentChatMessageCreate


class DocumentChatService:
    def __init__(self):
        self.client = OpenAI(
            base_url=f"{settings.LLM_HOST}/v1", api_key=settings.LLM_SECRET
        )

    def chat(
        self,
        chat_message: DocumentChatMessageCreate,
        user: User,
        session: Session,
        knowledge_base_service: KnowledgeBaseService,
        file_storage_service: FileStorageService,
    ):
        if not chat_message.conversation_id:
            conversation = Conversation(
                title=chat_message.message[0:50],  # store max 50 characters
                user_id=user.id,
            )
            session.add(conversation)
        else:
            statement = select(Conversation).where(
                Conversation.id == chat_message.conversation_id
            )
            conversation = session.exec(statement).one()

        message = ChatMessage(
            message=chat_message.message,
            role=chat_message.role,
            conversation_id=conversation.id,
        )

        session.add(message)

        # Get relevant chunks from the knowledge base
        points = knowledge_base_service.search_from_vector_store(
            document_id=str(chat_message.document_id), query=chat_message.message
        )
        retrieved_chunks = [point.payload["text"] for point in points]
        context = "\n\n".join(retrieved_chunks)

        completion = self.client.chat.completions.create(
            model="o3-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Answer questions using only the provided context. If the answer is not in the context, say 'I don't know'",
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion:\n{chat_message.message}",
                },
            ],
            temperature=0,
        )

        llm_message = ChatMessage(
            message=completion.choices[0].message.content,
            role="bot",
            conversation_id=conversation.id,
        )
        session.add(llm_message)

        session.commit()
        session.refresh(conversation)
        session.refresh(message)
        session.refresh(llm_message)

        # Create citations
        citations: list[Citation] = []
        for point in points:
            document = file_storage_service.get_file(
                user, session, point.payload["document_id"]
            )
            citation = Citation(
                point_id=point.id,
                score=point.score,
                page_number=point.payload["page_number"],
                chuck=point.payload["text"],
                document=document,
            )
            citations.append(citation)

        return ChatMessageWithCitations(chat_message=llm_message, citations=citations)
