# Environment Variables Setup

## Quick Setup

1. **Create a `.env.local` file** in the project root directory (same folder as `package.json`)

2. **Get your Supabase credentials:**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Select your project
   - Go to **Settings** → **API**
   - Copy the following values:
     - **Project URL** (looks like `https://xxxxx.supabase.co`)
     - **service_role key** (the secret key, NOT the anon key)
     - **anon public key** (the public key)

3. **Add these to your `.env.local` file:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Important Notes:**
   - Do NOT use quotes around the values
   - Do NOT commit `.env.local` to git (it's already in `.gitignore`)
   - Make sure there are no spaces around the `=` sign
   - The service_role key is secret - keep it safe!

## Example `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.example
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDB9.example
```

## Verify Setup

After creating `.env.local`, you can test it by running:
```bash
npm run upload-data
```

The script will show you if the environment variables are found correctly.

