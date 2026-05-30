# WhatsApp AI Agent — Nashik Real Estate

A full-stack WhatsApp chatbot built with **Next.js**, **Supabase**, and **OpenRouter**. It receives WhatsApp messages via the **Meta WhatsApp Business API**, replies using an AI trained on Nashik real estate project data, and provides a **real-time dashboard** to view chats, toggle AI/Human mode, and send manual replies.

**Repository:** [github.com/Anant-4-code/chatbot](https://github.com/Anant-4-code/chatbot)

---

## Table of contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Tech stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Environment variables (all API keys)](#environment-variables-all-api-keys)
6. [Master setup order (do in this sequence)](#master-setup-order-do-in-this-sequence)
7. [Supabase — full step-by-step (account, SQL, every key)](#supabase--full-step-by-step-account-sql-every-key)
8. [Meta WhatsApp — full step-by-step (every token)](#meta-whatsapp--full-step-by-step-every-token)
9. [OpenRouter — full step-by-step (API key + model)](#openrouter--full-step-by-step-api-key--model)
10. [Quick start (local)](#quick-start-local)
11. [Webhook configuration](#webhook-configuration)
12. [Test vs public (anyone can message)](#test-vs-public-anyone-can-message)
13. [Deploy to Vercel](#deploy-to-vercel)
14. [API routes](#api-routes)
15. [Dashboard usage](#dashboard-usage)
16. [Project structure](#project-structure)
17. [Troubleshooting](#troubleshooting)
18. [Security](#security)

---

## Features

- Incoming WhatsApp messages via Meta webhook
- AI auto-replies using Nashik real estate knowledge base (`src/lib/knowledge/nashik-realestate.md`)
- **Agent mode** — AI responds automatically
- **Human mode** — messages stored only; you reply from the dashboard
- Real-time conversation list (Supabase Realtime)
- Delete conversations from the dashboard
- Handles rapid messages without duplicate greeting replies

---

## Architecture

```
User (WhatsApp)
    │
    ▼
Meta WhatsApp Cloud API
    │  POST /api/webhook
    ▼
Next.js App (Vercel or local + ngrok)
    ├── Store message → Supabase
    ├── Load chat history → OpenRouter (Gemini / Claude / etc.)
    ├── Send reply → Meta Graph API
    └── Dashboard reads/writes Supabase (Realtime)
```

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL + Realtime) |
| AI | OpenRouter (OpenAI-compatible API) |
| Messaging | Meta WhatsApp Business Cloud API |
| UI | React 19, Tailwind CSS 4 |

---

## Prerequisites

- **Node.js** 20+ and **npm**
- [Meta Developer](https://developers.facebook.com/) account
- [Meta Business](https://business.facebook.com/) portfolio (for permanent tokens & going live)
- [Supabase](https://supabase.com/) project (free tier OK)
- [OpenRouter](https://openrouter.ai/) account
- For local webhook testing: [ngrok](https://ngrok.com/) (or deploy to Vercel)
- For **public** use: your own **+91** (or country) phone number + business verification

---

## Environment variables (all API keys)

Copy the template file:

```bash
cp .env.example .env
```

Fill in **every** variable below. Use the same names in **Vercel → Project → Settings → Environment Variables** for production.

> **Never commit `.env` to Git.** It is listed in `.gitignore`.

### Complete reference table

| Variable | Required | Where to get it (detailed steps) | Example format |
|----------|----------|----------------------------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | [Supabase Step 6](#step-6-get-next_public_supabase_url-project-url) | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | [Supabase Step 7](#step-7-get-next_public_supabase_anon_key-anon-public-key) | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | [Supabase Step 8](#step-8-get-supabase_service_role_key-service-role--secret) | `eyJhbGciOiJIUzI1NiIs...` |
| `WHATSAPP_ACCESS_TOKEN` | Yes | [Meta Step 6](#step-6-get-whatsapp_access_token-permanent--recommended) | `EAAxxxxxxxx...` |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes | [Meta Step 4](#step-4-get-whatsapp_phone_number_id) | `1095564300314733` |
| `WHATSAPP_VERIFY_TOKEN` | Yes | [Meta Step 5](#step-5-create-whatsapp_verify_token-you-choose-this) — you create it | `anant` |
| `OPENROUTER_API_KEY` | Yes | [OpenRouter Step 3](#step-3-get-openrouter_api_key) | `sk-or-v1-xxxxxxxx...` |
| `AI_MODEL` | Yes | [OpenRouter Step 4](#step-4-choose-and-set-ai_model) | `google/gemini-2.0-flash-001` |
| `NEXT_PUBLIC_APP_URL` | Yes | [OpenRouter Step 5](#step-5-set-app-url-variables) | `http://localhost:3000` or Vercel URL |
| `PORT` | Optional | Local only (default 3000) | `3000` |

### Recommended `AI_MODEL` values

| Model ID | Notes |
|----------|--------|
| `google/gemini-2.0-flash-001` | **Recommended** — fast, works well with large knowledge base |
| `openai/gpt-4o-mini` | Cheaper OpenAI option |
| `anthropic/claude-3.5-sonnet` | Strong reasoning (check OpenRouter for exact ID) |

Avoid invalid IDs such as `minimax/minimax-m2.5:free` (often returns "Model not found").

### Example `.env` file (placeholders only)

```env
# Meta WhatsApp
WHATSAPP_ACCESS_TOKEN=EAA_PASTE_YOUR_PERMANENT_TOKEN_HERE
WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN=anant

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-PASTE_YOUR_KEY_HERE
AI_MODEL=google/gemini-2.0-flash-001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE

# App
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

After deploying to Vercel, set `NEXT_PUBLIC_APP_URL` to your production URL, e.g. `https://chatbot-xxx.vercel.app`.

### Which keys are required? (minimum checklist)

You need **all 9** of these before the bot works end-to-end:

| # | Variable | Service |
|---|----------|---------|
| 1 | `NEXT_PUBLIC_SUPABASE_URL` | Supabase |
| 2 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | Supabase |
| 4 | `WHATSAPP_ACCESS_TOKEN` | Meta |
| 5 | `WHATSAPP_PHONE_NUMBER_ID` | Meta |
| 6 | `WHATSAPP_VERIFY_TOKEN` | You create (Meta webhook) |
| 7 | `OPENROUTER_API_KEY` | OpenRouter |
| 8 | `AI_MODEL` | OpenRouter (model name) |
| 9 | `NEXT_PUBLIC_APP_URL` | Your app URL |

Optional: `PORT` (default `3000` for local dev).

---

## Master setup order (do in this sequence)

Follow this order the first time you set up the project:

| Step | What to do | Section |
|------|------------|---------|
| 1 | Create Supabase project + run SQL + copy **3 keys** | [Supabase](#supabase--full-step-by-step-account-sql-every-key) |
| 2 | Create Meta app + get **token**, **Phone Number ID**, **verify token** | [Meta](#meta-whatsapp--full-step-by-step-every-token) |
| 3 | Create OpenRouter account + **API key** + choose **model** | [OpenRouter](#openrouter--full-step-by-step-api-key--model) |
| 4 | Copy `.env.example` → `.env` and paste all keys | [Example `.env`](#example-env-file-placeholders-only) |
| 5 | `npm install` && `npm run dev` | [Quick start](#quick-start-local) |
| 6 | Expose server (ngrok or Vercel) + configure Meta **webhook** | [Webhook](#webhook-configuration) |
| 7 | Add **test phone numbers** in Meta (dev mode) | [Meta Step 7](#step-7-add-test-recipients-development-only) |
| 8 | Send a test WhatsApp message | — |

---

## Supabase — full step-by-step (account, SQL, every key)

Supabase stores all conversations and messages. The dashboard and webhook both use it.

### Supabase: which keys you need (and which you do not)

This app uses **exactly 3** values from Supabase. Copy all three from **one** project: **Project Settings** (gear) → **API**.

| Copy into `.env` | Required? | Where in Supabase dashboard | Used by |
|------------------|-----------|-----------------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | **API** → **Project URL** | Dashboard + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | **API** → **Project API keys** → row `anon` / `public` | Dashboard (browser, Realtime) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | **API** → **Project API keys** → row `service_role` / `secret` | Server only (webhook, API routes) |

**You do NOT put these in `.env` for this project** (common confusion):

| Supabase shows this | Needed for this bot? |
|---------------------|----------------------|
| Database password (from project creation) | **No** — only if you connect with pgAdmin/SQL client directly |
| **Connection string** / **URI** (Database → Connection string) | **No** — the app uses the REST API, not direct Postgres |
| **JWT Secret** (API settings) | **No** — Supabase SDK uses the keys above |
| **Project ID** / **Reference ID** alone | **No** — it is already inside the URL (`https://YOUR_REF.supabase.co`) |
| `publishable` key (if shown on newer dashboards) | **No** — use `anon` + `service_role` as in the table above |

**Quick navigation:** [supabase.com/dashboard](https://supabase.com/dashboard) → your project → bottom-left **Project Settings** (⚙) → **API**.

```
Project Settings → API
├── Project URL          → NEXT_PUBLIC_SUPABASE_URL
└── Project API keys
    ├── anon  public     → NEXT_PUBLIC_SUPABASE_ANON_KEY
    └── service_role secret → SUPABASE_SERVICE_ROLE_KEY
```

After Steps 1–8 below, paste the same three variables into **Vercel → Settings → Environment Variables** when you deploy.

### What Supabase is used for in this project

| Part of app | Supabase usage |
|-------------|----------------|
| Webhook (`/api/webhook`) | Saves incoming/outgoing messages |
| Dashboard | Lists chats, shows messages, real-time updates |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only (webhook API routes) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (dashboard) |

---

### Step 1: Create a Supabase account

1. Open [https://supabase.com](https://supabase.com).
2. Click **Start your project** or **Sign in**.
3. Sign up with **GitHub**, **Google**, or email.
4. Confirm your email if asked.

---

### Step 2: Create a new project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Click **New project** (green button).
3. Fill in:
   - **Organization** — pick existing or create one (e.g. your name).
   - **Project name** — e.g. `whatsapp-agent` or `nashik-chatbot`.
   - **Database password** — create a **strong password** and **save it somewhere safe** (you need it only if you connect to DB directly; the app uses API keys, not this password).
   - **Region** — choose closest to you (e.g. **South Asia (Mumbai)** for India).
4. Click **Create new project**.
5. Wait **1–2 minutes** until status shows the project is ready (green / active).

---

### Step 3: Run the database SQL (create tables)

This creates `conversations` and `messages` tables.

1. In the left sidebar, click **SQL Editor** (icon looks like `</>`).
2. Click **+ New query** (top right).
3. On your computer, open the file [`supabase-schema.sql`](./supabase-schema.sql) from this repo.
4. **Select all** the SQL (Ctrl+A) and **copy** it.
5. **Paste** into the Supabase SQL Editor text area.
6. Click **Run** (or press Ctrl+Enter).
7. You should see **Success. No rows returned** (or similar green success message).

**What this SQL creates:**

| Table | Purpose |
|-------|---------|
| `conversations` | One row per WhatsApp user (phone, name, AI/Human mode) |
| `messages` | Every user and bot message |
| Indexes | Faster queries |
| Realtime | Dashboard updates live when new messages arrive |

---

### Step 4: Verify tables exist

1. Left sidebar → **Table Editor**.
2. You should see two tables:
   - `conversations`
   - `messages`
3. Click each table — they should be **empty** (0 rows) until someone messages the bot.

If tables are missing, run the SQL from Step 3 again.

---

### Step 5: Enable Realtime (if not already in SQL)

The `supabase-schema.sql` file already includes:

```sql
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
```

To double-check:

1. Left sidebar → **Database** → **Publications** (under Database).
2. Open `supabase_realtime`.
3. Confirm `messages` and `conversations` are listed.

If not, run the two `alter publication` lines from `supabase-schema.sql` in SQL Editor again.

---

### Step 6: Get `NEXT_PUBLIC_SUPABASE_URL` (Project URL)

This is **not** a secret token — it is the public address of your Supabase project.

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard) and click **your project** (the one where you ran `supabase-schema.sql`).
2. Left sidebar → **Project Settings** (gear icon at the **bottom** of the sidebar).
3. In the settings submenu, click **API** (not Database, not Auth).
4. At the top, find the section **Project URL** (sometimes labeled **URL**).
5. You will see a value like:
   ```text
   https://abcdefghijklmnop.supabase.co
   ```
   The part before `.supabase.co` is your **project reference** (e.g. `abcdefghijklmnop`). Every key in Steps 7–8 must come from the **same** project as this URL.
6. Click the **Copy** icon next to the URL.
7. Paste into your `.env` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   ```

**Important:**

- Include `https://` at the start.
- Do **not** add a trailing `/` at the end.
- Do **not** use the **Database** → **Connection string** URL — that is for Postgres clients, not this app.

---

### Step 7: Get `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public key)

Stay on the same page: **Project Settings** → **API** (do not leave this page between Steps 6–8).

1. Scroll down to **Project API keys** (below Project URL).
2. You will see a table with two rows (names may vary slightly by Supabase UI version):
   - **`anon`** — role: **`public`**
   - **`service_role`** — role: **`secret`** (you need this in Step 8; do not copy it yet if you are following in order)
3. On the **`anon` / `public`** row, click **Reveal** (eye icon) if the key is hidden.
4. Click **Copy** on the long string. It always starts with `eyJ` (a JWT).
5. Paste into `.env` on **one line** with no spaces or quotes:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

**Used by:** the dashboard in the browser (`src/app/page.tsx`) for **Realtime** (live message updates).

**Note:** The `NEXT_PUBLIC_` prefix means this value is bundled for the browser. That is normal for the anon key; still do not commit `.env` to Git.

---

### Step 8: Get `SUPABASE_SERVICE_ROLE_KEY` (service role — secret)

Still on **Project Settings** → **API** → **Project API keys**.

1. Find the second row: **`service_role`** — role **`secret`**.
2. Click **Reveal**. Supabase may show a warning: *“This key has the ability to bypass Row Level Security.”* — click through to reveal.
3. Click **Copy** on the **entire** key (also starts with `eyJ`, but it is a **different** longer JWT than the anon key).
4. Paste into `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

**How to tell you copied the right key:**

| Key | Row name | Goes in `.env` variable |
|-----|----------|-------------------------|
| Anon | `anon` / `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Service role | `service_role` / `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

If both variables look identical, you copied the same row twice — go back and copy `service_role` again.

**Warning:**

- **Never** put this key in frontend code, `NEXT_PUBLIC_*` variables, or GitHub.
- **Never** share it in screenshots or chat.
- Used by: webhook (`/api/webhook`), conversation APIs, and `src/lib/supabase.ts` on the server.

---

### Step 9: Save your `.env` Supabase section

Your `.env` should now have all three:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key...
```

---

### Step 10: Test Supabase (optional)

1. **Table Editor** → `conversations` → **Insert row** (optional manual test).
2. Or run the app locally (`npm run dev`), send a WhatsApp test message — new rows should appear in `conversations` and `messages`.
3. Open the dashboard at `http://localhost:3000` — if Realtime works, new messages appear without refreshing.

**Supabase setup is complete** when:

- [ ] Tables `conversations` and `messages` exist (Step 4)
- [ ] All **3** keys are in `.env` (Steps 6–9)
- [ ] URL and both JWT keys are from the **same** Supabase project

**If the dashboard is blank but WhatsApp works:** check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser). **If messages are not saved:** check `SUPABASE_SERVICE_ROLE_KEY` and Vercel logs.

---

## Meta WhatsApp — full step-by-step (every token)

You need **3 Meta-related values** in `.env`:

| Variable | You get it from |
|----------|-----------------|
| `WHATSAPP_ACCESS_TOKEN` | Meta System User (permanent token) |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp → API Setup |
| `WHATSAPP_VERIFY_TOKEN` | **You make it up** (any secret word) |

---

### Step 1: Create a Meta Developer account

1. Go to [https://developers.facebook.com](https://developers.facebook.com).
2. Log in with Facebook.
3. Accept developer terms if prompted.

---

### Step 2: Create an app

1. Top menu → **My Apps** → **Create App**.
2. **Use cases** — select **Other** (or **Business** if shown).
3. **App type** → **Business**.
4. Click **Next**.
5. **App name** — e.g. `Nashik WhatsApp Bot`.
6. **App contact email** — your email.
7. **Business portfolio** — select or create a Meta Business account.
8. Click **Create app**.
9. Complete security check (password) if asked.

---

### Step 3: Add WhatsApp product

1. On the app dashboard, find **WhatsApp** under **Add products to your app**.
2. Click **Set up** on WhatsApp.
3. You are taken to **WhatsApp** → **API Setup**.

You will see:

- A **test phone number** (e.g. `+1 555 630 7932`) — customers message **this** number in dev.
- A **temporary access token** — expires in ~24 hours (do not rely on it long-term).
- **Phone number ID** — copy this for `WHATSAPP_PHONE_NUMBER_ID`.

---

### Step 4: Get `WHATSAPP_PHONE_NUMBER_ID`

1. Stay on **WhatsApp** → **API Setup**.
2. Under **Send and receive messages** → section **From**.
3. You see the test number and a field **Phone number ID** (numeric, e.g. `1095564300314733`).
4. Click copy or note it down.
5. Add to `.env`:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=1095564300314733
   ```

**Do not confuse with:**

- The phone number people dial (`+1 555...`) — that is NOT the Phone Number ID.
- WhatsApp Business Account ID — also NOT this field.

---

### Step 5: Create `WHATSAPP_VERIFY_TOKEN` (you choose this)

This is **not** downloaded from Meta. **You invent it.**

1. Pick any secret string only you know, for example:
   - `anant`
   - `my_whatsapp_verify_2024`
   - `nashik_bot_secret_xyz`
2. Add to `.env`:
   ```env
   WHATSAPP_VERIFY_TOKEN=anant
   ```
3. When you configure the webhook in Meta later, type the **exact same** string in the **Verify token** field.

If they do not match, webhook verification fails with **403 Forbidden**.

---

### Step 6: Get `WHATSAPP_ACCESS_TOKEN` (permanent — recommended)

The token on API Setup page expires quickly. Use a **System User** token for production.

#### 6a. Open Business Settings

1. Go to [https://business.facebook.com/settings](https://business.facebook.com/settings).
2. Left menu → **Users** → **System users**  
   Direct link: [business.facebook.com/settings/system-users](https://business.facebook.com/settings/system-users)

#### 6b. Create a System User

1. Click **Add**.
2. Name: e.g. `whatsapp-api-bot`.
3. Role: **Admin**.
4. Click **Create system user**.

#### 6c. Assign your app to the System User

1. Click the new system user name.
2. Click **Add assets**.
3. Asset type: **Apps**.
4. Select your WhatsApp app.
5. Enable **Full control** (or manage app + WhatsApp permissions).
6. Save.

#### 6d. Generate the token

1. Click **Generate new token**.
2. Select your **app**.
3. Set expiration: **Never** (or 60 days and renew — Never is easier for servers).
4. Check these permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. Click **Generate token**.
6. **Copy immediately** — Meta shows it only once. Long string starting with `EAA...`.
7. Add to `.env`:
   ```env
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxx...
   ```

Also add the same value in **Vercel** environment variables when you deploy.

**Temporary token (not recommended):** On API Setup you can click **Generate access token** — only use for quick tests; it expires.

---

### Step 7: Add test recipients (Development only)

While app mode is **Development**, Meta only allows **5 phone numbers** to receive bot replies.

1. [developers.facebook.com](https://developers.facebook.com) → your app → **WhatsApp** → **API Setup**.
2. Find section **To** → **Select a recipient phone number**.
3. Click **Add phone number** or the dropdown.
4. Enter country code + number:
   - India example: country `IN`, number `8624043412` → stored as `918624043412` in database.
5. Click **Next** — Meta sends a **WhatsApp OTP** to that phone.
6. Enter the code to verify.
7. Repeat for every person who should test the bot (max 5).

**If you skip this:** User messages may show in your dashboard, but WhatsApp reply fails with error `(#131030) Recipient phone number not in allowed list`.

---

### Step 8: Save your `.env` Meta section

```env
WHATSAPP_ACCESS_TOKEN=EAA...your_permanent_token...
WHATSAPP_PHONE_NUMBER_ID=your_numeric_id
WHATSAPP_VERIFY_TOKEN=anant
```

**Meta setup is complete** when all three are set and test recipients are added.

---

## OpenRouter — full step-by-step (API key + model)

OpenRouter powers the AI replies. You need **2 values**:

| Variable | What it is |
|----------|------------|
| `OPENROUTER_API_KEY` | Secret API key from OpenRouter |
| `AI_MODEL` | Model ID string (which AI brain to use) |

---

### Step 1: Create an OpenRouter account

1. Go to [https://openrouter.ai](https://openrouter.ai).
2. Click **Sign in** or **Sign up**.
3. Sign in with Google, GitHub, or email.

---

### Step 2: Add credits (if required)

1. Click your profile / **Credits** or [openrouter.ai/credits](https://openrouter.ai/credits).
2. Some models have a free tier; others need balance.
3. Add a small amount ($5) if you hit "insufficient credits" errors.

---

### Step 3: Get `OPENROUTER_API_KEY`

1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys).
2. Click **Create Key** (or **Create API Key**).
3. Name: e.g. `whatsapp-nashik-bot`.
4. Click **Create**.
5. Copy the key — starts with `sk-or-v1-`.
6. Add to `.env`:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
   ```

**Never commit this key to GitHub.**

---

### Step 4: Choose and set `AI_MODEL`

1. Open [https://openrouter.ai/models](https://openrouter.ai/models).
2. Search for a model, for example **Gemini 2.0 Flash**.
3. Open the model page and copy the **model ID** (exact string).

**Recommended for this project:**

```env
AI_MODEL=google/gemini-2.0-flash-001
```

| Model ID | Notes |
|----------|--------|
| `google/gemini-2.0-flash-001` | Recommended — fast, handles large knowledge file |
| `openai/gpt-4o-mini` | Cheaper alternative |
| `anthropic/claude-3.5-sonnet` | Copy exact ID from OpenRouter site |

**Avoid:** `minimax/minimax-m2.5:free` and other invalid IDs — causes `Model not found` errors.

4. Add to `.env`:
   ```env
   AI_MODEL=google/gemini-2.0-flash-001
   ```

---

### Step 5: Set app URL variables

For local development:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

After Vercel deploy, change to:

```env
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

OpenRouter uses `NEXT_PUBLIC_APP_URL` in request headers (optional metadata).

---

### Step 6: Save your `.env` OpenRouter section

```env
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=google/gemini-2.0-flash-001
```

**OpenRouter setup is complete.**

---

### How the AI knowledge base works

The bot does not only use OpenRouter — it loads:

- `src/lib/system-prompt.ts` — behavior rules
- `src/lib/knowledge/nashik-realestate.md` — Nashik project brochures and contacts

You can edit the markdown file to change what the bot knows.

---

## Quick start (local)

After completing Supabase, Meta, and OpenRouter steps above:

```bash
# 1. Clone
git clone https://github.com/Anant-4-code/chatbot.git
cd chatbot

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Paste ALL keys from Supabase, Meta, and OpenRouter sections above

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the dashboard (empty until messages arrive).

**Next:** [Configure webhook](#webhook-configuration) so WhatsApp can reach your server.

---

## Webhook configuration

Meta must call your server at:

```text
https://YOUR_PUBLIC_HOST/api/webhook
```

### Local development (ngrok)

```bash
npm run dev
# In another terminal:
ngrok http 3000
```

Use the `https://....ngrok-free.app` URL.

### Meta dashboard

1. App → **WhatsApp** → **Configuration**.
2. **Webhook** → **Edit**:
   - **Callback URL:** `https://YOUR_HOST/api/webhook`
   - **Verify token:** same as `WHATSAPP_VERIFY_TOKEN`
3. Click **Verify and save**.
4. **Webhook fields** → subscribe to **messages**.

### Test verification manually

```bash
curl "http://localhost:3000/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test123"
```

Should return: `test123`

---

## Test vs public (anyone can message)

| | Development (test number) | Live (your own number) |
|--|---------------------------|-------------------------|
| Who can chat | Only **5** numbers you add in API Setup | **Anyone** on WhatsApp |
| Business number | `+1 555...` (Meta test) | Your `+91...` number |
| Profile | Shows "Test Number" | Your business name & photo |
| Recipient list | Required | Not required |

### To allow anyone to message (production)

1. Complete **Meta Business verification**.
2. Add your **own** WhatsApp Business phone number in WhatsApp Manager.
3. Get **display name** approved.
4. Update `WHATSAPP_PHONE_NUMBER_ID` to the new number’s ID.
5. Deploy app to Vercel with all env vars.
6. Set webhook to `https://your-app.vercel.app/api/webhook`.
7. Switch app from **Development** → **Live** in Meta App Dashboard.
8. Add billing in Meta Business (WhatsApp API has per-conversation charges after free tier).

WhatsApp Manager: [business.facebook.com/wa/manage/home/](https://business.facebook.com/wa/manage/home/)

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Your message"
git push origin main
```

### 2. Import on Vercel

1. [vercel.com/new](https://vercel.com/new) → import `Anant-4-code/chatbot`.
2. Framework: **Next.js** (auto-detected).

### 3. Build settings (important)

| Setting | Value |
|---------|--------|
| **Build Command** | `npm run build` |
| **Output Directory** | Next.js default (leave empty) |
| **Install Command** | `npm install` |

Do **not** use `npm run dev` as the build command.

### 4. Environment variables on Vercel

Add **all** variables from [the table above](#complete-reference-table) for **Production** (and Preview if you want):

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `OPENROUTER_API_KEY`
- `AI_MODEL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://your-project.vercel.app`

### 5. Deploy and update Meta webhook

1. Deploy → copy production URL.
2. Meta → WhatsApp → Configuration → set webhook to `https://your-project.vercel.app/api/webhook`.
3. Redeploy if you change env vars (or use Vercel “Redeploy”).

---

## API routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/webhook` | Meta webhook verification (`hub.mode`, `hub.verify_token`, `hub.challenge`) |
| `POST` | `/api/webhook` | Receive WhatsApp messages, AI reply, store in DB |
| `GET` | `/api/conversations` | List all conversations |
| `PATCH` | `/api/conversations/[id]` | Update `mode`: `agent` \| `human` |
| `DELETE` | `/api/conversations/[id]` | Delete conversation and messages |
| `GET` | `/api/conversations/[id]/messages` | Messages for one conversation |
| `POST` | `/api/conversations/[id]/send` | Send manual message from dashboard |

---

## Dashboard usage

1. Open the app URL (local or Vercel).
2. **Sidebar** — all chats, sorted by latest activity; badge **AI** or **You** (human mode).
3. Click a conversation to open the thread.
4. **AI Mode** (green) — bot auto-replies on WhatsApp.
5. **Human Mode** (orange) — bot stops auto-reply; use the input bar to send messages manually.
6. **Delete** — removes conversation and messages from Supabase.

---

## Project structure

```text
whatsapp-agent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhook/route.ts          # Meta incoming messages
│   │   │   └── conversations/            # Dashboard API
│   │   ├── page.tsx                      # Dashboard UI
│   │   └── layout.tsx
│   └── lib/
│       ├── ai.ts                         # OpenRouter calls
│       ├── whatsapp.ts                   # Send via Meta Graph API
│       ├── supabase.ts                   # DB client
│       ├── system-prompt.ts              # AI behavior + knowledge loader
│       ├── knowledge/
│       │   └── nashik-realestate.md      # Project brochures / training data
│       └── types.ts
├── supabase-schema.sql                   # Run once in Supabase
├── .env.example                          # Template for all env vars
├── .env                                  # Your secrets (local, not in git)
└── README.md
```

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|--------|----------|
| Webhook verification fails | Token mismatch | Same `WHATSAPP_VERIFY_TOKEN` in `.env` and Meta |
| Messages in dashboard, no WhatsApp reply | Number not on test list | Add phone in API Setup → **To** (dev mode) |
| `(#131030) Recipient not in allowed list` | Outbound blocked | Add recipient or go **Live** with own number |
| `Sorry, I couldn't generate a response.` | OpenRouter empty/error | Check `OPENROUTER_API_KEY`, use `google/gemini-2.0-flash-001` |
| `Model not found` | Invalid `AI_MODEL` | Pick a valid ID from OpenRouter |
| Bot repeats same greeting | Fast messages / old deploy | Pull latest code; delete chat; test one message at a time |
| WhatsApp send works for you only | Dev recipient list | Add each tester’s number in Meta |
| Dashboard empty | Wrong Supabase keys | Check URL + anon key; run schema SQL |
| Build fails on Vercel | Wrong build command | Use `npm run build`, not `npm run dev` |
| Token expired | Temporary Meta token | Use System User permanent token |
| ngrok blocked | Cross-origin (dev) | Add host to `allowedDevOrigins` in `next.config` if needed |

### Check Vercel logs

Vercel → Project → **Logs** → filter for `Webhook error` or `WhatsApp send failed`.

### Check Supabase

**Table Editor** → `messages` — confirm `user` and `assistant` rows exist.

---

## Security

- **Do not** commit `.env`, `.mcp.json`, or real tokens to GitHub.
- Use `.env.example` with empty values for documentation only.
- Rotate keys if they were ever exposed in chat or commits.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — server-side only, never expose to the browser.
- For production, prefer **System User** tokens over short-lived developer tokens.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | Run ESLint |

---

## License

Private project — adjust as needed for your organization.

---

## Support checklist (copy before go-live)

```
[ ] supabase-schema.sql executed
[ ] All 9 env vars set locally and on Vercel
[ ] WHATSAPP_ACCESS_TOKEN = permanent System User token
[ ] AI_MODEL = google/gemini-2.0-flash-001
[ ] Webhook URL ends with /api/webhook
[ ] WHATSAPP_VERIFY_TOKEN matches Meta
[ ] Test recipients added (dev) OR app is Live (production)
[ ] NEXT_PUBLIC_APP_URL = production Vercel URL
[ ] Vercel build command = npm run build
[ ] Test message from phone → reply on WhatsApp + dashboard
```
