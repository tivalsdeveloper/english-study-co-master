create table if not exists public.english_assignments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.english_groups(id) on delete cascade,
  teacher_id uuid not null references public.english_profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  instructions text not null check (char_length(instructions) between 10 and 8000),
  due_at timestamptz,
  max_points integer not null default 100 check (max_points between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.english_assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.english_assignments(id) on delete cascade,
  student_id uuid not null references public.english_profiles(id) on delete cascade,
  answer text not null check (char_length(answer) between 1 and 12000),
  submitted_at timestamptz not null default now(),
  score integer check (score >= 0),
  feedback text not null default '',
  unique (assignment_id, student_id)
);

create index if not exists english_assignments_group_created_idx on public.english_assignments (group_id, created_at desc);
create index if not exists english_assignments_teacher_idx on public.english_assignments (teacher_id);
create index if not exists english_submissions_assignment_idx on public.english_assignment_submissions (assignment_id);
create index if not exists english_submissions_student_idx on public.english_assignment_submissions (student_id);

alter table public.english_assignments enable row level security;
alter table public.english_assignment_submissions enable row level security;

create policy "group members view assignments" on public.english_assignments
for select using (
  teacher_id = (select auth.uid()) or group_id in (
    select group_id from public.english_group_members where user_id = (select auth.uid())
  )
);

create policy "group teachers create assignments" on public.english_assignments
for insert with check (
  teacher_id = (select auth.uid()) and exists (
    select 1 from public.english_groups g
    where g.id = group_id and g.teacher_id = (select auth.uid())
  )
);

create policy "group teachers update assignments" on public.english_assignments
for update using (
  teacher_id = (select auth.uid()) and exists (
    select 1 from public.english_groups g
    where g.id = group_id and g.teacher_id = (select auth.uid())
  )
) with check (
  teacher_id = (select auth.uid()) and exists (
    select 1 from public.english_groups g
    where g.id = group_id and g.teacher_id = (select auth.uid())
  )
);

create policy "group teachers delete assignments" on public.english_assignments
for delete using (
  teacher_id = (select auth.uid()) and exists (
    select 1 from public.english_groups g
    where g.id = group_id and g.teacher_id = (select auth.uid())
  )
);

create policy "students and teachers view submissions" on public.english_assignment_submissions
for select using (
  student_id = (select auth.uid()) or exists (
    select 1 from public.english_assignments a
    where a.id = assignment_id and a.teacher_id = (select auth.uid())
  )
);

create policy "students submit own work" on public.english_assignment_submissions
for insert with check (
  student_id = (select auth.uid()) and exists (
    select 1
    from public.english_assignments a
    join public.english_group_members m on m.group_id = a.group_id
    where a.id = assignment_id and m.user_id = (select auth.uid())
  )
);

create policy "teachers grade submissions" on public.english_assignment_submissions
for update using (
  exists (
    select 1 from public.english_assignments a
    where a.id = assignment_id and a.teacher_id = (select auth.uid())
  )
) with check (
  exists (
    select 1 from public.english_assignments a
    where a.id = assignment_id and a.teacher_id = (select auth.uid())
  )
);

grant select, insert, update, delete on public.english_assignments to authenticated;
grant select, insert, update on public.english_assignment_submissions to authenticated;
