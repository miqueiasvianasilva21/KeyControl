# Gerenciamento de Chaves

## Requisitos

- Docker
- Docker Compose

## Como subir com Docker Compose

1. Clone o repositório.
2. Copie [`.env.example`](/home/mike/projects/copia/gerenciamento-chaves/.env.example) para `.env`.
3. Ajuste as variáveis se quiser mudar portas, host ou credenciais.
4. Suba os containers:

```bash
docker compose up -d --build
```

5. Acesse:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Comandos úteis

Subir em primeiro plano:

```bash
docker compose up --build
```

Parar os containers:

```bash
docker compose down
```

Ver logs:

```bash
docker compose logs -f
```

Usar outras portas no host:

```bash
BACKEND_PORT=3001 FRONTEND_PORT=5174 docker compose up -d --build
```

## Observações

- O backend executa migrations e seed automaticamente ao iniciar.
- O usuário administrativo inicial é `admin@ufam.edu.br`.

