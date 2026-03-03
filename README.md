# Orçamento Digital

## Desenvolvimento

```bash
docker compose up --build
```

## Produção

1. Crie o arquivo de variáveis:

```bash
cp .env.prod.example .env.prod
```

2. Ajuste os valores do `.env.prod` (principalmente `SECRET_KEY`, domínios e senha do banco).

3. Suba o ambiente de produção:

```bash
docker compose -f compose.prod.yml --env-file .env.prod up -d --build
```

## Acessos locais padrão

- Frontend: http://localhost:3000
- Backend (API): http://localhost:8000
- Admin Django: http://localhost:8000/admin
