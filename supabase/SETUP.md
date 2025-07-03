# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project" and fill in:
   - Organization: Your org name
   - Project name: `ai-fantasy-draft`
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users

## 2. Run the Database Schema

1. Once your project is created, go to the SQL Editor
2. Copy the contents of `schema.sql` and paste it into the editor
3. Click "Run" to create all tables and policies

## 3. Get Your API Keys

1. Go to Settings → API
2. Copy these values to your backend `.env` file:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: The `anon` public key
   - `SUPABASE_SERVICE_KEY`: The `service_role` secret key (keep this secure!)

## 4. Configure Authentication (Optional)

For this app, we're using Sleeper's username-based system, but you can enable Supabase Auth:

1. Go to Authentication → Providers
2. Enable any providers you want (Email, Google, etc.)
3. Configure redirect URLs for your frontend

## 5. Database Security

The schema includes Row Level Security (RLS) policies that ensure:
- Users can only see/modify their own data
- Analysis cache is publicly readable but expires
- Draft sessions are user-specific

## 6. Testing the Connection

Run the backend server and check the logs to ensure Supabase connects successfully:

```bash
cd backend
npm run dev
```

You should see no errors related to Supabase initialization.