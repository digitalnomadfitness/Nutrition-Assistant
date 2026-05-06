# Your Nutrition Assistant — Vercel Deployment Guide

This folder is ready to deploy to Vercel. Follow the steps below in order.

## What's inside

```
dnf-deploy/
├── index.html          ← your guide (with password gate added)
├── api/
│   ├── auth.js         ← validates the password
│   └── meal-plan.js    ← secure proxy to Claude (your API key lives only on the server)
├── vercel.json
├── package.json
└── README.md           ← this file
```

## Why two environment variables instead of one

The password gate (`SITE_PASSWORD`) and the Claude API key (`ANTHROPIC_API_KEY`) are both stored on Vercel's servers — never in the HTML file. This means:

- Visitors can't see your API key by viewing page source
- The AI meal planner only works for people who entered the right password
- You can change the password later without touching any code

## Step-by-step deployment

### 1. Get your Anthropic API key

1. Go to https://console.anthropic.com
2. Sign in (or create an account)
3. Add a payment method and a small credit balance ($5–10 is plenty to start)
4. Click **API Keys** in the left sidebar → **Create Key**
5. Copy the key (it starts with `sk-ant-`). You'll only see it once, so paste it somewhere safe for the next step.

### 2. Push this folder to Vercel

The easiest path is the Vercel CLI:

```bash
# In your terminal, from inside the dnf-deploy folder:
npm install -g vercel
vercel login
vercel
```

When prompted:
- "Set up and deploy?" → **Y**
- "Which scope?" → pick your account
- "Link to existing project?" → **N**
- "What's your project's name?" → `nutrition-assistant` (or whatever you like)
- "In which directory is your code located?" → `./`
- "Want to modify these settings?" → **N**

You'll get a preview URL. The site won't work yet — you need to add the environment variables first.

**Alternative: GitHub deployment.** If you'd rather use GitHub, push this folder to a new repo, then on vercel.com click **Add New → Project → Import** and select that repo. The build settings auto-detect; just click Deploy.

### 3. Add the two environment variables

1. Open https://vercel.com/dashboard and click into your project
2. Go to **Settings → Environment Variables**
3. Add the first one:
   - Key: `SITE_PASSWORD`
   - Value: `Jade`
   - Environments: check all three (Production, Preview, Development)
   - Click **Save**
4. Add the second one:
   - Key: `ANTHROPIC_API_KEY`
   - Value: paste your `sk-ant-...` key from step 1
   - Environments: check all three
   - Click **Save**

### 4. Redeploy so the variables take effect

In the Vercel dashboard, go to **Deployments → ⋯ (on the latest deployment) → Redeploy**.
(Or run `vercel --prod` from your terminal.)

### 5. Test it

Visit your live URL. You should see:

1. The green password screen → enter `Jade` → guide loads
2. Browse to the **Meal Planner AI** tab → set your preferences → click **Generate** → a meal plan should appear within 10–20 seconds

If something doesn't work, see Troubleshooting below.

## Changing the password later

1. Vercel dashboard → your project → **Settings → Environment Variables**
2. Click the ⋯ next to `SITE_PASSWORD` → **Edit**
3. Type the new password → Save
4. Redeploy (Deployments tab → latest → ⋯ → Redeploy)

## Connecting your custom domain

1. Vercel dashboard → your project → **Settings → Domains**
2. Add `digitalnomadfitness.com` (or a subdomain like `guide.digitalnomadfitness.com`)
3. Vercel shows you DNS records to add at your domain registrar — copy them over and wait a few minutes for propagation

## Cost expectations

- **Vercel hosting:** free Hobby plan covers this easily
- **Claude API usage:** with `claude-sonnet-4-6`, each meal plan generation costs roughly $0.01–0.03 depending on length. 100 generations ≈ $1–3.
- If you want to lower costs, edit `api/meal-plan.js` and change `model: 'claude-sonnet-4-6'` to `model: 'claude-haiku-4-5-20251001'`. Haiku is roughly 5x cheaper and still produces solid meal plans.

## Troubleshooting

**The password screen appears but won't accept "Jade"**
The `SITE_PASSWORD` env var didn't get set, or you didn't redeploy after adding it. Check Settings → Environment Variables, then redeploy.

**The meal planner says "Server is not fully configured"**
Either `SITE_PASSWORD` or `ANTHROPIC_API_KEY` is missing. Add both, redeploy.

**The meal planner says "Session expired"**
Refresh the page and re-enter the password. This happens if you change the password on Vercel but the browser still has the old one cached.

**The meal planner says something about Anthropic**
Most likely your API key is invalid or your Anthropic account has no credit. Check console.anthropic.com → Billing.

**I want stronger security than a client-side gate**
The current setup keeps your API key completely safe (it's only on the server) but the guide content itself is technically viewable by someone determined enough to inspect the browser. If you need true server-enforced gating of the content, the cleanest path is upgrading to Vercel Pro ($20/month) and turning on **Deployment Protection → Password** in Settings. That gates the entire site at the edge before any HTML is served.

## What changed from your V2 file

- `gen()` now calls `/api/meal-plan` instead of Anthropic directly
- The `YOUR_API_KEY_HERE` placeholder is gone — the key lives in Vercel env vars
- Added a password gate overlay at the top of `<body>` (DNF-branded green styling)
- Updated the meal planner placeholder text to match the new flow
