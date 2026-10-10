# They Were Here — Runbook

## Emergency Commands

### Kill Switch (disable all note posting)
```sql
update public.app_config set value = 'false'::jsonb where key = 'notes_enabled';
```

### Re-enable posting
```sql
update public.app_config set value = 'true'::jsonb where key = 'notes_enabled';
```

### Hide a specific note instantly
```sql
update public.notes set status = 'hidden' where id = '<note-id>';
```

### Event Mode (hackathon venue settings)
```sql
update public.app_config set value = '50'::jsonb where key = 'common_spacing_m';
update public.app_config set value = '40'::jsonb where key = 'unlock_radius_m';
update public.app_config set value = '35'::jsonb where key = 'max_accuracy_m';
```

### Demo Mode (instant publish, higher daily cap)
```sql
update public.app_config set value = '0'::jsonb where key = 'publish_delay_minutes';
update public.app_config set value = '50'::jsonb where key = 'max_notes_per_day';
```

### Revert to production defaults
```sql
update public.app_config set value = '150'::jsonb where key = 'common_spacing_m';
update public.app_config set value = '60'::jsonb where key = 'unlock_radius_m';
update public.app_config set value = '50'::jsonb where key = 'max_accuracy_m';
update public.app_config set value = '10'::jsonb where key = 'publish_delay_minutes';
update public.app_config set value = '5'::jsonb where key = 'max_notes_per_day';
```

## Redeploy Steps

1. Push to `main` branch
2. Vercel auto-deploys
3. On demo phones: close and reopen the PWA (autoUpdate will trigger)
4. Verify build ID in Me tab matches the latest commit

## Monitoring

- Check the Supabase dashboard for error logs
- Watch the `notes` table for new entries during the overnight wall
- Skim note bodies hourly from the Supabase table editor
