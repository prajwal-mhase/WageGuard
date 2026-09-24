from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes import entries, rates, reports

app = FastAPI(
    title="WageGuard API",
    description=(
        "Reference wage check and earnings ledger for informal workers. "
        "MVP scope: Maharashtra, Construction of Roads and Buildings, Zone I. "
        "This API performs a deterministic reference-rate comparison only "
        "and does not provide legal advice or legal certification."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(entries.router)
app.include_router(rates.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok", "scope": "Maharashtra / Construction of Roads and Buildings / Zone I"}
