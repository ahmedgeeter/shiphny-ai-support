import os
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

def get_llm_for_query(user_query: str):
    """
    Model Gateway / Router:
    Routes to a heavy model for complex queries and a fast, cheap model for simple queries.
    Demonstrates Cloud FinOps and cost optimization.
    """
    complex_keywords = ["cancel", "refund", "invoice", "balance", "update"]
    
    is_complex = any(keyword in user_query.lower() for keyword in complex_keywords)
    
    if is_complex:
        # Route to a heavy model
        # Try OpenAI GPT-4o, fallback to Gemini 1.5 Pro
        if os.getenv("OPENAI_API_KEY"):
            return ChatOpenAI(model="gpt-4o", temperature=0)
        else:
            return ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0)
    else:
        # Route to a fast, cheap model
        if os.getenv("GROQ_API_KEY"):
            return ChatGroq(model="llama3-8b-8192", temperature=0)
        elif os.getenv("OPENAI_API_KEY"):
            return ChatOpenAI(model="gpt-4o-mini", temperature=0)
        else:
            return ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
