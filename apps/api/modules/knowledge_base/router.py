from fastapi import APIRouter

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])


@router.get("/")
def get_knowledge_base():
    return {"message": "Knowledge Base API"}
