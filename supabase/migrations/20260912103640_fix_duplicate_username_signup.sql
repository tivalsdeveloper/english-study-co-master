create or replace function private.create_english_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  requested_username text;
  final_username text;
begin
  requested_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    'learner_' || substr(new.id::text, 1, 8)
  );
  final_username := left(requested_username, 24);

  if exists (
    select 1 from public.english_profiles
    where lower(username) = lower(final_username)
  ) then
    final_username := left(requested_username, 19) || '_' || substr(new.id::text, 1, 4);
  end if;

  insert into public.english_profiles(id, full_name, username, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    final_username,
    case when new.raw_user_meta_data->>'role' = 'teacher' then 'teacher' else 'student' end
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;
