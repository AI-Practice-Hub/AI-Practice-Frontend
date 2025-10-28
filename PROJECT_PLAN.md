# AI-Powered Automated Testing Platform: Project Plan

## Frontend (Next.js)

### Tech Stack
- Next.js (App Router)
- React (Context API or Zustand)
- TypeScript
- Tailwind CSS (dark/light theme)
- NextAuth.js (email/password authentication)
- Socket.IO or native WebSocket
- Axios
- SWR or React Query
- ESLint, Prettier
- Jest/React Testing Library

### Folder Structure
```
/AI-Practice-Frontend
│
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── signup/
│   │   ├── chat/
│   ├── components/
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── AuthForm.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useAuth.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── ChatContext.tsx
│   │   ├── ThemeContext.tsx
│   ├── utils/
│   │   ├── api.ts
│   │   ├── socket.ts
│   ├── styles/
│   ├── types/
│   ├── middleware.ts
│   ├── pages/
│   ├── tests/
├── .env.local
├── tailwind.config.js
├── next.config.js
├── package.json
└── README.md
```

### Key File Responsibilities
- `app/layout.tsx`: Global providers, Tailwind styles.
- `app/page.tsx`: Homepage UI.
- `app/login/`, `app/signup/`: Auth forms, NextAuth integration.
- `app/chat/`: Main chat UI, sidebar, chat window, persistent state.
- `components/`: Modular UI components.
- `context/`: Global state for auth, chat, theme.
- `hooks/`: Custom hooks for chat, auth, theme.
- `utils/api.ts`: Axios instance.
- `utils/socket.ts`: WebSocket client.
- `middleware.ts`: Auth middleware.
- `types/`: TypeScript interfaces.
- `tests/`: Unit/integration tests.

### Implementation Notes
- Context API/Zustand for chat state (persistent via localStorage/IndexedDB).
- Fetch chat history on load, sync state.
- WebSocket for real-time chat.
- Theme context for dark/light mode.
- NextAuth for authentication.
- Responsive, accessible UI.
- Error handling, loading states, optimistic UI.

---

## Backend (FastAPI)

### Tech Stack
- FastAPI (Python)
- SQLite (SQLAlchemy ORM)
- WebSocket (FastAPI)
- LangChain (LLM integration)
- Google LLM API
- Pydantic
- Passlib
- JWT
- CORS
- pytest

### Folder Structure
```
/AI-Practice-Backend
│
├── app/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   ├── auth.py
│   ├── websocket.py
│   ├── llm.py
│   ├── db.py
│   ├── dependencies.py
│   ├── config.py
│   ├── tests/
├── requirements.txt
├── .env
└── README.md
```

### Key File Responsibilities
- `main.py`: FastAPI app, routes, CORS, startup/shutdown.
- `models.py`: SQLAlchemy models.
- `schemas.py`: Pydantic schemas.
- `crud.py`: DB operations.
- `auth.py`: JWT, password hashing, login/signup.
- `websocket.py`: WebSocket endpoint.
- `llm.py`: LangChain + Google LLM.
- `db.py`: DB session setup.
- `dependencies.py`: Dependency injection.
- `config.py`: Config/env management.
- `tests/`: Backend tests.

### Implementation Notes
- JWT-based authentication.
- CRUD endpoints for chat/messages.
- WebSocket for real-time chat.
- LangChain/Google LLM for replies.
- Store chat/messages in SQLite.
- Error handling, validation, logging.
- CORS for frontend communication.
- Environment variables for secrets/API keys.

---

## Implementation Approach
1. Initialize Next.js frontend with TypeScript and Tailwind.
2. Set up authentication (NextAuth, email/password).
3. Build homepage, login, signup, chat UI with sidebar.
4. Implement chat state management, persistent storage.
5. Integrate WebSocket client for chat.
6. Add dark/light theme toggle/context.
7. Set up FastAPI backend with SQLite, JWT auth, WebSocket.
8. Implement CRUD for users, chats, messages.
9. Integrate LangChain and Google LLM.
10. Connect frontend to backend.