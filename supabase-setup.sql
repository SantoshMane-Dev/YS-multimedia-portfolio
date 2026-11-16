create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portfolio_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  media_type text not null check (media_type in ('video', 'image')),
  category text not null,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  object_path text not null unique,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint portfolio_items_category_check check (
    (media_type = 'video' and category in (
      'mehendi', 'grahdev', 'bangdiya', 'haldi', 'engagement', 'wedding',
      'digital-wedding-invitation', 'reception', 'cinematic-pre-wedding',
      'couple-reels', 'save-the-date', 'birthday', 'anniversary',
      'baby-welcome-shoot', 'shop-opening', 'new-car-delivery', 'vatpournima',
      'baby-shoot'
    ))
    or
    (media_type = 'image' and category in (
      'wedding-cards', 'banners', 'social-media', 'custom-graphics'
    ))
  )
);

alter table public.portfolio_items enable row level security;

grant select on public.portfolio_items to anon, authenticated;
grant insert, update, delete on public.portfolio_items to authenticated;

drop policy if exists "Published portfolio items are public" on public.portfolio_items;
create policy "Published portfolio items are public"
on public.portfolio_items for select
to anon, authenticated
using (is_published or public.is_portfolio_admin());

drop policy if exists "Admins can insert portfolio items" on public.portfolio_items;
create policy "Admins can insert portfolio items"
on public.portfolio_items for insert
to authenticated
with check (public.is_portfolio_admin());

drop policy if exists "Admins can update portfolio items" on public.portfolio_items;
create policy "Admins can update portfolio items"
on public.portfolio_items for update
to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

drop policy if exists "Admins can delete portfolio items" on public.portfolio_items;
create policy "Admins can delete portfolio items"
on public.portfolio_items for delete
to authenticated
using (public.is_portfolio_admin());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'portfolio-media',
  'portfolio-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Published portfolio media is readable" on storage.objects;
create policy "Published portfolio media is readable"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'portfolio-media'
  and (
    public.is_portfolio_admin()
    or exists (
      select 1
      from public.portfolio_items
      where object_path = storage.objects.name
        and is_published
    )
  )
);

drop policy if exists "Admins can upload portfolio media" on storage.objects;
create policy "Admins can upload portfolio media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
);

drop policy if exists "Admins can update portfolio media" on storage.objects;
create policy "Admins can update portfolio media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
)
with check (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
);

drop policy if exists "Admins can delete portfolio media" on storage.objects;
create policy "Admins can delete portfolio media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
);
