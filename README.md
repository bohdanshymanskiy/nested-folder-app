# Full Stack File Service

- `backend` - NestJS REST API with Swagger docs, auth, file/folder hierarchy, search, reorder, cloning, visibility, and sharing by email.
- `frontend` - React + TypeScript + MobX UI for authentication and file/folder management.

## Run Backend (without Docker)

```bash
cd backend
npm install
npm run start:dev
```

Backend URL: `http://localhost:3001`  
Swagger docs: `http://localhost:3001/docs`

## Run Frontend (without Docker)

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

## Run with Docker

From the project root:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up --build -d
```

Stop containers:

```bash
docker compose down
```

URLs when running with Docker:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`

## Key Implemented Checkpoints

- Simple authentication (`/auth/register`, `/auth/login`)
- Simple UI (React)
- Hierarchical folders/files (`parentId`)
- Unit tests (`files.service.spec.ts`)
- Clone / remove / rename / edit
- Search by name (`q` query)
- Public/private visibility and public links
- Share access via email with permission
