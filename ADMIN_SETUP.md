# Portfolio admin setup

The admin page uses Supabase Auth, a private Storage bucket, and row-level
security policies. Visitors can read only published items; only user IDs in
`portfolio_admins` can upload, edit, publish, or delete portfolio items.

## 1. Create and configure Supabase

1. Create a Supabase project.
2. In the SQL Editor, run the contents of `supabase-setup.sql`.
3. In Authentication, create or invite the owner's user with email and password.
   Public sign-up is not part of this site.
4. In the SQL Editor, add that user as an admin (replace the email):

   ```sql
   insert into public.portfolio_admins (user_id)
   select id from auth.users where email = 'owner@example.com'
   on conflict do nothing;
   ```

5. In Project Settings → API, copy the Project URL and the **publishable**
   (or legacy `anon`) key into `portfolio-config.js`:

   ```js
   window.PORTFOLIO_CONFIG = {
     supabaseUrl: "https://YOUR_PROJECT.supabase.co",
     supabaseAnonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY",
   };
   ```

   Never put a `service_role` or secret key in this website.

## 2. Use the dashboard

Open `/admin.html` over the deployed website's HTTPS address, sign in with the
owner account, then upload an image or video, choose its category, and save it.
Uploads are drafts by default. Use the dashboard's publish control to make an
item visible in its category library. The dashboard also supports editing
titles/descriptions/categories and deleting items.

The configured bucket accepts JPEG, PNG, WebP, GIF, MP4, WebM, and QuickTime
files up to 50 MiB each. Larger files require a Supabase plan and bucket limit
that supports them; increase the limit in both this setup SQL and Storage
settings if needed.

## Notes

- The static pages must be served from a web server; `file://` is not supported.
- Supabase's allowed site and redirect URLs must include the deployed website.
- Published media is intended to be public and can be saved by visitors. Draft
  media remains private.
- Keep backups of original media. Deleting a portfolio item also deletes its
  stored file.
