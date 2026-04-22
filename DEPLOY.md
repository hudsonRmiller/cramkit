# CramKit — Deployment Guide

You already know how to push to GitHub and deploy on Vercel from the finalcalc project. This guide focuses on the NEW parts: Stripe (payments) and the Claude API.

---

## Step 1: Create a new GitHub repo and push

```bash
cd ~/Desktop/cramkit
git init
echo "node_modules" > .gitignore
git add .
git commit -m "initial commit"
git branch -M main
```

Go to https://github.com/new → create a repo called `cramkit` → then:

```bash
git remote add origin https://hudsonRmiller:YOUR_TOKEN_HERE@github.com/hudsonRmiller/cramkit.git
git push -u origin main
```

Use the same Personal Access Token from before (or generate a new one at https://github.com/settings/tokens).

---

## Step 2: Get a Stripe account (this is how you get paid)

1. Go to https://stripe.com
2. Click "Start now" and create an account
3. You'll land on the Stripe Dashboard
4. **Important**: You start in "Test mode" (toggle in the top right). This lets you test payments with fake card numbers before going live.

### Get your Stripe Secret Key:
1. In the Stripe Dashboard, click **"Developers"** in the top-right area
2. Click **"API keys"**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) — you don't need this one
   - **Secret key** (starts with `sk_test_...`) — click "Reveal test key" and copy it
4. **Save this key somewhere safe** — you'll paste it into Vercel in Step 4

### To go live (accept real payments):
1. Click **"Activate your account"** or complete the onboarding Stripe walks you through
2. You'll need: your legal name, address, bank account for payouts, and SSN (for tax purposes)
3. Once activated, switch the toggle from "Test" to "Live"
4. Go back to Developers → API keys and copy the LIVE secret key (starts with `sk_live_...`)
5. Replace the test key in Vercel with the live key

**You can deploy and test everything with the test key first**, then switch to live when you're ready to charge real money.

---

## Step 3: Get an Anthropic API key (this powers the AI)

1. Go to https://console.anthropic.com
2. Sign up or sign in
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Name it "cramkit" and click Create
6. **Copy the key immediately** — you can never see it again
7. **Save it somewhere safe**

### Add credits:
1. In the Anthropic console, go to **"Plans & Billing"** or **"Billing"**
2. Add a payment method (credit card)
3. Add $5-10 in credits to start — this will last hundreds of generations
4. Each generation costs roughly $0.01-0.03 (you're charging users $3.99, so the margin is massive)

---

## Step 4: Deploy on Vercel with environment variables

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your `cramkit` repo
4. **BEFORE clicking Deploy**, click on **"Environment Variables"**
5. Add these two variables:

| Name | Value |
|------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_xxxxx...` (your Stripe secret key) |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx...` (your Anthropic API key) |

6. To add each one: type the name in "Key", paste the value in "Value", and click "Add"
7. Now click **"Deploy"**

Your site is live. The AI and payments are connected.

---

## Step 5: Test it

1. Visit your live Vercel URL (e.g., `cramkit.vercel.app`)
2. Pick a tool, paste some text, click Generate
3. You'll be redirected to Stripe Checkout
4. Since you're in test mode, use this fake card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: any future date (e.g., `12/28`)
   - CVC: any 3 digits (e.g., `123`)
   - Name/address: anything
5. Click Pay
6. You should be redirected back to your site and see the AI-generated content

If it works → you're ready to go live.

---

## Step 6: Go live with real payments

1. Go to your Stripe Dashboard
2. Complete account activation if you haven't (they walk you through it)
3. Switch the toggle from "Test" to "Live" mode
4. Go to Developers → API keys → copy your LIVE secret key (starts with `sk_live_...`)
5. Go to your Vercel Dashboard → cramkit project → Settings → Environment Variables
6. Find `STRIPE_SECRET_KEY` → click the three dots → Edit → paste the live key → Save
7. Click **"Redeploy"** in your Vercel dashboard (Deployments tab → three dots on latest → Redeploy)

Now real credit cards work and money goes to your Stripe account. Stripe transfers payouts to your bank account (usually within 2 business days).

---

## Step 7: Buy a domain (optional but recommended)

Same process as finalcalc:
1. Buy a domain on https://porkbun.com (try `cramkit.com`, `cramkit.app`, `getcramkit.com`)
2. In Vercel → Settings → Domains → add the domain
3. In Porkbun → DNS → add the records Vercel shows you
4. Wait a few minutes for propagation

---

## Step 8: Promote it

Same playbook as finalcalc, but this one is a MUCH easier sell because it's a paid product that actually does something unique:

- Reddit: r/college, r/studying, r/university — "I built an AI tool that makes you a custom study plan from your syllabus"
- School group chats and Discord servers
- Instagram/TikTok — screen record yourself pasting a syllabus and getting a study plan back

The pitch: "I was procrastinating during finals and built a thing that turns your syllabus into a personalized study plan and practice exam. $4, no signup."

---

## How the money flows

1. Student pays $3.99 via Stripe
2. Stripe takes ~$0.42 in fees (2.9% + $0.30)
3. Claude API costs ~$0.01-0.03 per generation
4. **You keep ~$3.55 per sale**
5. Stripe sends payouts to your bank account automatically

10 sales = ~$35
100 sales = ~$355
1,000 sales = ~$3,550

---

## File structure

```
cramkit/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .gitignore
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   └── App.jsx
└── api/
    ├── create-checkout.js    ← Stripe payment
    └── generate.js           ← Claude AI + payment verification
```

---

## Troubleshooting

**Stripe checkout redirects but nothing generates:**
→ Check Vercel function logs: Dashboard → your project → Logs tab. Look for errors.

**"Could not verify payment" error:**
→ Make sure STRIPE_SECRET_KEY in Vercel matches your Stripe mode (test key for test mode, live key for live mode).

**AI generation fails:**
→ Check that ANTHROPIC_API_KEY is correct in Vercel environment variables, and that you have credits in your Anthropic account.

**Environment variable changes not taking effect:**
→ After changing env vars in Vercel, you need to redeploy: Deployments tab → three dots → Redeploy.
