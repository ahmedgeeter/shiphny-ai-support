from langchain_core.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy import select, or_
from app.db.database import AsyncSessionLocal
from app.models.knowledge_base import KnowledgeBaseArticle

class SearchKBArgs(BaseModel):
    query: str = Field(description="The search query or keywords to look for in the knowledge base.")

@tool(args_schema=SearchKBArgs)
async def search_knowledge_base(query: str) -> str:
    """
    Search the company knowledge base (FAQ, policies, shipping rates, etc.) 
    Use this tool whenever the customer asks a general question about the service, 
    such as shipping rates, return policy, forbidden items, or contact info.
    """
    try:
        async with AsyncSessionLocal()() as session:
            # We will split the query into words and search for any of them in title or content
            words = [w.strip() for w in query.split() if len(w.strip()) > 2]
            if not words:
                words = [query.strip()]
                
            conditions = []
            for word in words:
                conditions.append(KnowledgeBaseArticle.title.ilike(f"%{word}%"))
                conditions.append(KnowledgeBaseArticle.content.ilike(f"%{word}%"))
                conditions.append(KnowledgeBaseArticle.keywords.ilike(f"%{word}%"))
                
            stmt = select(KnowledgeBaseArticle).where(
                KnowledgeBaseArticle.is_active == True,
                or_(*conditions)
            ).limit(3)
            
            result = await session.execute(stmt)
            articles = result.scalars().all()
            
            if not articles:
                return f"No articles found in the knowledge base matching '{query}'. Advise the customer to contact support directly."
            
            # Increment usage count for analytics (done asynchronously)
            for article in articles:
                article.increment_usage()
            await session.commit()
            
            responses = []
            for article in articles:
                responses.append(f"Title: {article.title}\nContent: {article.content}")
                
            return "Knowledge Base Results:\n\n" + "\n\n---\n\n".join(responses)
            
    except Exception as e:
        return f"An error occurred while searching the knowledge base: {str(e)}"
