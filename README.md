# Career Spark

An app that remembers why someone mattered, not just who they are.

Status: actively in development. This README and the commit history get updated as each phase is finished, so you can watch the project take shape.

## The problem I kept running into

I go to a networking event most weeks. I'll meet someone and think, this could actually go somewhere. Then a week goes by, another event happens, another set of people, and the specific reason that first conversation felt promising is just gone. I still have their name. I don't have the story anymore.

The tools people usually reach for here, Notion, a spreadsheet, a basic CRM, are built to hold facts: name, company, tag. They're not built to hold the reason a five minute conversation stuck with you. That's the part that actually fades, and that's the part none of those tools try to save.

## What the app does

You record a short voice note right after meeting someone, talking about it the way you'd tell a friend. From there:

1. The recording gets transcribed
2. Claude reads the transcript and pulls out a short narrative, not a form, along with any concrete signals in the conversation (an offer to make an introduction, a mention of a job opening, a specific plan to meet again)
3. Each contact gets a warmth score that fades over time, unless something happens to reset it
4. When a contact is worth following up with, an agent looks at the situation, decides on an approach (a plain check in, a message tied to recent news about their company, or a more direct ask), and drafts something grounded in what was actually said
5. You can search past conversations by what they were about, not by exact keywords

## Why I'm calling the agent part agentic, and not just "using AI"

The follow up agent isn't one prompt that always spits out the same kind of message. It's given a goal and a small set of tools: check the current warmth score, pull the stored history for a contact, look up recent news about their company. It decides on its own which of these to use, in what order, based on what it finds along the way, before it writes anything. That decision making loop is what makes it an agent rather than a single AI generated draft. It's built directly on Claude's tool use API.

## How the pieces fit together

```
Voice note
    |
    v
Frontend (React / Next.js)
    |
    v
Backend API (Next.js API routes)
    |
    +--> Deepgram (speech to text)
    +--> Claude (narrative and signal extraction)
    +--> Embedding model
              |
              v
    Postgres (structured data) + pgvector (semantic search)
              |
              v
      Decay engine (warmth scoring over time)
              |
        +-----+-----+
        v           v
    Dashboard   Follow up agent (Claude, tool use)
                     |
                     v
              Drafted message

```

## Stack

| Layer | Tech | What it's doing |
|---|---|---|
| Frontend | React / Next.js | Recording the voice note, showing the dashboard |
| Backend | Next.js API routes | Coordinating everything below |
| Speech to text | Deepgram (nova-3) | Turning the voice note into a transcript |
| Extraction and agent | Claude API | Narrative extraction, signal detection, the follow up agent |
| Database | PostgreSQL with pgvector | Storing contacts and running semantic search |
| Hosting | Vercel | Deployment and, later, the scheduled decay job |

## On scope

Right now this is a single user tool. I built it for myself, and it doesn't store anyone else's data. Once it's further along I'll add a demo mode with made up sample contacts so other people can look through it without any real data touching the system. Supporting real multiple users is something I'm deliberately leaving for later, not something I overlooked.

## Where things stand

- [x] Architecture and phased plan worked out
- [ ] Phase 1: voice note to transcript to narrative to storage (in progress)
- [ ] Phase 2: embeddings and semantic search
- [ ] Phase 3: decay engine
- [ ] Phase 4: follow up agent
- [ ] Phase 5: demo mode and polish

## Running it locally

```bash
git clone <this-repo>
cd networking-agent
npm install
```

Create a `.env.local` file:
```
ANTHROPIC_API_KEY=your_key_here
DEEPGRAM_API_KEY=your_key_here
DATABASE_URL=your_postgres_connection_string
```

```bash
npm run dev
```

## Background

I moved to the US recently and started going to a lot of networking events while job hunting. This project came out of noticing the same problem happen week after week and deciding to build something about it instead of just living with it.