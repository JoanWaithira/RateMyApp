This is an app to rate my digital twin.

## Run locally

1. Create `.env` from `.env.example` and fill in your keys.
2. Start dev server:

```bash
npm run dev
```

3. Open `http://localhost:8888`.

## Store responses in two Supabase databases

Set these variables in `.env`:

```env
SUPABASE_URL=https://your-primary-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_primary_service_role_key

SUPABASE_URL_SECONDARY=https://your-secondary-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY_SECONDARY=your_secondary_service_role_key
```

Notes:
- The same table (`survey_responses`) must exist in both projects.
- If secondary credentials are missing, the app saves only to the primary DB.
- If secondary is configured but write fails, the API returns an error that primary saved but secondary failed.
