import asyncio
import sys

sys.path.insert(0, "..")

from app.models import Base  # noqa: E402
from app.db.session import engine  # noqa: E402


async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized.")


if __name__ == "__main__":
    asyncio.run(init())
