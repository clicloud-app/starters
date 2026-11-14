"""A FastAPI app on CLI, storing items in Postgres (DATABASE_URL comes from the template's database)."""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from psycopg_pool import ConnectionPool
from pydantic import BaseModel, Field

pool = ConnectionPool(os.environ["DATABASE_URL"], min_size=1, max_size=5, open=False)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    pool.open()
    with pool.connection() as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, name TEXT NOT NULL)")
    yield
    pool.close()


app = FastAPI(title="Items on CLI", lifespan=lifespan)


class NewItem(BaseModel):
    name: str = Field(min_length=1, max_length=200)


@app.get("/health")
def health():
    try:
        with pool.connection() as conn:
            conn.execute("SELECT 1")
    except Exception:
        # The details go to the logs, not to whoever asked: they can name hosts and users.
        logging.exception("health check: database unreachable")
        return JSONResponse({"ok": False, "error": "database unreachable"}, status_code=503)
    return {"ok": True}


@app.get("/items")
def list_items():
    with pool.connection() as conn:
        rows = conn.execute("SELECT id, name FROM items ORDER BY id DESC LIMIT 100").fetchall()
    return [{"id": r[0], "name": r[1]} for r in rows]


@app.post("/items", status_code=201)
def add_item(item: NewItem):
    with pool.connection() as conn:
        row = conn.execute("INSERT INTO items (name) VALUES (%s) RETURNING id", (item.name,)).fetchone()
    if not row:
        raise HTTPException(500, "Couldn't save the item")
    return {"id": row[0], "name": item.name}
