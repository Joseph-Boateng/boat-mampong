# QuickRun GH — Setup Guide
> Follow these steps in order. You'll go from zero to a running app.

---

## Step 1: Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the green button)
3. Run the installer and follow the prompts
4. When done, open a terminal (Command Prompt on Windows) and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`. That means it worked.

---

## Step 2: Set Up Your Database (Supabase — Free)

1. Go to **https://supabase.com** and create a free account
2. Click **"New Project"** — give it a name like `quickrun-gh`
3. Set a strong database password (save it somewhere!)
4. Once the project is ready, click **"SQL Editor"** in the left sidebar
5. Copy the entire contents of `backend/database/schema.sql` and paste it into the SQL Editor
6. Click **"Run"** — this creates all your database tables

**Get your connection string:**
- Go to **Settings → Database**
- Copy the **Connection string** (URI format)
- It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`

---

## Step 3: Configure the Backend

1. Open the `backend` folder
2. Copy `.env.example` and rename it to `.env`
3. Fill in the values:
   ```
   DATABASE_URL=postgresql://postgres:[your-password]@db.[your-ref].supabase.co:5432/postgres
   JWT_SECRET=make_up_any_long_random_string_here_like_this_x8f2k9
   FRONTEND_URL=http://localhost:5173
   PORT=5000
   ```

---

## Step 4: Install & Run the Backend

Open a terminal in the `backend` folder:

```bash
# Install all packages
npm install

# Start the server (development mode with auto-reload)
npm run dev
```

You should see:
```
QuickRun GH API running on port 5000
Connected to PostgreSQL database
```

Leave this terminal open.

---

## Step 5: Install & Run the Frontend

Open a **second** terminal in the `frontend` folder:

```bash
# Install all packages
npm install

# Start the frontend
npm run dev
```

You should see a URL like `http://localhost:5173`

Open that URL in your browser — your app is running!

---

## How to Test It

1. Go to `http://localhost:5173`
2. Click **"Register"** and create 3 test accounts:
   - One as **Customer**
   - One as **Vendor**
   - One as **Rider**
3. Log in as **Vendor** → go to Products → add some items
4. Log in as **Customer** → browse → add to cart → place an order
5. Log back in as **Vendor** → confirm the order → mark ready
6. Log in as **Rider** → accept the delivery → mark delivered
7. Log back in as **Customer** → check order tracking

---

## Deploying Online (So Anyone Can Use It)

### Deploy Frontend → Vercel (Free)

1. Go to **https://vercel.com** and create an account
2. Install Vercel CLI: `npm install -g vercel`
3. In the `frontend` folder, run: `vercel`
4. Follow the prompts — your frontend gets a live URL (e.g. `https://quickrun-gh.vercel.app`)

### Deploy Backend → Railway (Free tier)

1. Go to **https://railway.app** and create an account
2. Click **"New Project" → "Deploy from GitHub"**
   - First push your code to GitHub (create a repo and push the `quickrun-gh` folder)
3. Select the `backend` folder as the root
4. Add your environment variables (same as your `.env` file) in the Railway dashboard
5. Railway gives you a URL like `https://quickrun-gh-backend.railway.app`

### Connect frontend to backend on production

In your `frontend` folder, create a `.env.production` file:
```
VITE_API_URL=https://your-backend-url.railway.app
```

Then update `frontend/src/api/client.js`:
```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})
```

Also update your backend `.env` on Railway:
```
FRONTEND_URL=https://your-frontend-url.vercel.app
```

---

## Folder Structure

```
quickrun-gh/
├── SETUP_GUIDE.md          ← You are here
├── backend/
│   ├── server.js           ← Main entry point
│   ├── .env.example        ← Copy to .env and fill in
│   ├── package.json
│   ├── config/db.js        ← Database connection
│   ├── middleware/auth.js  ← JWT authentication
│   ├── routes/
│   │   ├── auth.js         ← Register, login
│   │   ├── vendors.js      ← Shop profiles
│   │   ├── products.js     ← Product CRUD
│   │   ├── orders.js       ← Order flow
│   │   └── riders.js       ← Rider profiles & earnings
│   └── database/
│       └── schema.sql      ← Run this in Supabase first!
└── frontend/
    ├── src/
    │   ├── App.jsx         ← Routing
    │   ├── api/client.js   ← API calls
    │   ├── context/        ← Auth & Cart state
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── customer/   ← Home, VendorDetail, Cart, OrderTracking
    │   │   ├── vendor/     ← Dashboard, Products, Orders
    │   │   └── rider/      ← Dashboard, Earnings
    │   └── components/Navbar.jsx
    └── package.json
```

---

## Common Issues

**"Cannot connect to database"**
→ Check your `DATABASE_URL` in `.env`. Make sure you replaced `[YOUR-PASSWORD]` with the actual password.

**"CORS error" in browser**
→ Make sure your backend `.env` has `FRONTEND_URL=http://localhost:5173`

**"npm: command not found"**
→ Node.js wasn't installed correctly. Restart your terminal and try again.

**Vendors page is blank**
→ No vendors have registered yet. Create a vendor account and set up a shop.

---

## Next Steps After Launch

- Add Paystack Mobile Money payment integration
- Add product image uploads (use Cloudinary — free tier)
- Add push notifications for order updates
- Build an admin dashboard to manage all users and orders
- Add SMS alerts via Hubtel (Ghana SMS gateway)

---

*Built with React + Node.js + PostgreSQL · QuickRun GH 2026*
