from fastapi import FastAPI
from data import orcamentos

app = FastAPI()

# Endpoints
@app.get("/api/orcamentos")
def listar_orcamentos():
    return orcamentos

@app.post("/api/orcamentos")
def criar_orcamento(payload: dict):
    payload["id"] = "RB-2026-002"
    return payload

@app.get("/api/orcamentos/{orcamento_id}/pdf")
def gerar_pdf(orcamento_id: str):
    return {
        "message": f"PDF fake do orçamento {orcamento_id}"
    }

# Teste com: uvicorn main:app --reload --port 8001
