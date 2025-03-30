from sqlmodel import Session, delete, select

from api.error import UserDefinedException
from api.models import ChatMessage, ChatMessageCreate, Conversation, User


class ChatService:
    def chat(self, chat_message: ChatMessageCreate, user: User, session: Session):
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

        # output = self.llm.invoke(chat_message.message)

        llm_message = ChatMessage(
            message="Test", role="bot", conversation_id=conversation.id
        )
        session.add(llm_message)

        session.commit()
        session.refresh(conversation)
        session.refresh(message)
        session.refresh(llm_message)

        return llm_message

    def get_conversation(self, conversation_id: str, session: Session, user: User):
        statement = select(Conversation).where(Conversation.id == conversation_id)
        conversation = session.exec(statement).first()

        if conversation is None:
            raise UserDefinedException(
                "Conversation not found", "CONVERSATION_NOT_FOUND"
            )

        if conversation.user_id != user.id:
            raise UserDefinedException(
                "You don't have access to this conversation", "CONVERSATION_PERMISSION"
            )

        return conversation

    def get_users_conversations(self, session: Session, user: User):
        statement = select(Conversation).where(Conversation.user_id == user.id)
        conversations = session.exec(statement).all()

        return conversations

    def delete_conversation(self, session: Session, user: User, conversation_id: str):
        statement = select(Conversation).where(Conversation.id == conversation_id)
        conversation = session.exec(statement).first()

        if conversation == None:
            raise UserDefinedException(
                "Conversation not found", "CONVERSATION_NOT_FOUND"
            )

        if conversation.user_id != user.id:
            raise UserDefinedException(
                "You don't have permission to remove this conversation", "PERMISSION"
            )

        session.delete(conversation)

        session.commit()
