import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.tools.customer_tools import search_customer

async def main():
    res = await search_customer.ainvoke({"query": "Tonya Johnson"})
    print(res)

if __name__ == "__main__":
    asyncio.run(main())
