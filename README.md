## AI Decision Ledger

AI Decision Ledger is an observability and debugging tool for AI systems. It records and visualizes AI decisions so developers can understand:

- who initiated a request  
- which AI model made the decision  
- which tools were called  
- what prompt was used  
- why the decision happened  
- what risk signals existed  

The system acts as **observability and debugging infrastructure for AI workflows**.

### High-level Architecture

- **SDKs** (Python)  
  - Lightweight decorator to wrap AI calls  
  - Automatically records prompts, responses, latency, and tool calls  
- **Trace API** (Fastify + Node.js)  
  - Receives trace events from SDKs  
  - Persists data to PostgreSQL  
  - Provides trace query and replay endpoints  
- **PostgreSQL**  
  - `traces` table: high-level execution metadata  
  - `steps` table: detailed prompt/response/tool call timeline  
- **Web Dashboard** (Next.js + Tailwind)  
  - Recent trace list and high‑risk overview  
  - Per-trace timeline visualization  
  - Replay button to re-run stored prompts

### Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS  
- **Backend**: Node.js, Fastify  
- **Database**: PostgreSQL  
- **SDK**: Python

---

## Project Structure

```text
ai-decision-ledger/
  backend/
    server.ts
    routes/
      traces.ts
    db.ts
    package.json
    tsconfig.json
    .env.example

  sdk/
    python/
      ailedger.py
      pyproject.toml
      requirements.txt

  frontend/
    package.json
    tsconfig.json
    next.config.mjs
    tailwind.config.js
    postcss.config.mjs
    pages/
      _app.tsx
      index.tsx
      traces.tsx
      traces/
        [id].tsx
    components/
      TraceTimeline.tsx
      Layout.tsx
    styles/
      globals.css
```

---

## Database Setup (PostgreSQL)

1. **Run PostgreSQL locally** (Docker example):

```bash
docker run --name ai-decision-ledger-postgres -e POSTGRES_PASSWORD=ledger -e POSTGRES_USER=ledger -e POSTGRES_DB=ledger -p 5432:5432 -d postgres:16
```

2. **Create tables**  
   The backend will automatically create tables on startup if they do not exist:

   - `traces`
   - `steps`

   Schema:

```sql
CREATE TABLE IF NOT EXISTS traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id UUID NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
  prompt TEXT,
  response TEXT,
  tool_call TEXT,
  latency_ms INTEGER,
  risk_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> Note: The migration above is executed programmatically by the backend on startup, so you do not need to run SQL manually.

---

## Backend Setup (Fastify + Node)

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

`.env.example`:

```bash
PORT=4000

PGHOST=localhost
PGPORT=5432
PGDATABASE=ledger
PGUSER=ledger
PGPASSWORD=ledger
```

### 3. Run the backend

```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:4000`.

### 4. API Endpoints

- **POST `/trace`**  
  Store a new trace and its steps.

  Request body (Python SDK compatible):

  ```json
  {
    "agent": "support_agent",
    "model": "claude",
    "prompt": "User question...",
    "response": "Model answer...",
    "timestamp": "2026-03-05T12:00:00Z",
    "tool_calls": [],
    "latency": 123
  }
  ```

- **GET `/traces`**  
  Returns recent traces including high‑level metadata and whether they include any high‑risk steps.

- **GET `/trace/:id`**  
  Returns a single trace and its ordered steps for timeline visualization.

- **POST `/trace/:id/replay`**  
  Replay a trace. For the MVP this returns a simulated replay response with the original prompt and model; it is the integration point where you can wire up your own LLM provider.

---

## Python SDK (`ailedger`)

The Python SDK provides a `@trace` decorator to wrap your AI calls and automatically send trace events to the backend.

### 1. Install the SDK locally

```bash
cd sdk/python
pip install -e .
```

This installs the `ailedger` package in editable mode.

### 2. Configure the API URL

By default the SDK sends events to `http://localhost:4000`.  
You can override this via environment variable:

```bash
export AI_DECISION_LEDGER_API_URL="http://localhost:4000"
```

### 3. Usage Example

```python
from ailedger import trace

def llm(prompt: str) -> str:
    # Call your model here
    return "mocked response"

@trace(agent="support_agent", model="claude")
def run_ai(prompt: str):
    return llm(prompt)

if __name__ == "__main__":
    print(run_ai("How can I reset my password?"))
```

When `run_ai` is called, a trace event with the following structure is sent to the backend:

```json
{
  "agent": "support_agent",
  "model": "claude",
  "prompt": "How can I reset my password?",
  "response": "mocked response",
  "timestamp": "2026-03-05T12:00:00Z",
  "tool_calls": [],
  "latency": 42
}
```

---

## Frontend (Next.js + Tailwind)

The web dashboard shows:

- **Recent traces**  
- **Errors / high‑risk actions**  
- **Per‑trace timeline**  
- **Replay button**

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Configure API base URL

The frontend reads the backend base URL from `NEXT_PUBLIC_API_BASE_URL`.  
Create a `.env.local` in `frontend/`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 3. Run the frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

### 4. Pages

- `/` – high‑level dashboard with recent traces and risk summary  
- `/traces` – table of recent traces with risk indicators  
- `/traces/[id]` – detailed per‑trace timeline with replay button

---

## End‑to‑End Test with a Sample Trace

1. **Start PostgreSQL**

```bash
docker run --name ai-decision-ledger-postgres -e POSTGRES_PASSWORD=ledger -e POSTGRES_USER=ledger -e POSTGRES_DB=ledger -p 5432:5432 -d postgres:16
```

2. **Start backend**

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

3. **Install SDK**

```bash
cd sdk/python
pip install -e .
```

4. **Start frontend**

```bash
cd frontend
cp .env.local.example .env.local 2>/dev/null || true
npm install
npm run dev
```

5. **Send a sample trace via Python**

Create a `test_trace.py` anywhere:

```python
from ailedger import trace
import time

def llm(prompt: str) -> str:
    time.sleep(0.1)
    return f"Echo: {prompt}"

@trace(agent="support_agent", model="claude")
def run_ai(prompt: str):
    return llm(prompt)

if __name__ == "__main__":
    print(run_ai("Test AI Decision Ledger"))
```

Run it:

```bash
python test_trace.py
```

6. **View in dashboard**

- Open `http://localhost:3000`  
- Navigate to **Traces**  
- Click on a trace to open its detail view and see the **timeline** and **Replay Trace** button.

---

## Git Workflow

This repository is initialized as a git repo. Typical workflow:

```bash
git add .
git commit -m "Initial AI Decision Ledger MVP"
git push origin main
```

You may adjust the remote and branch name as needed for your environment.

