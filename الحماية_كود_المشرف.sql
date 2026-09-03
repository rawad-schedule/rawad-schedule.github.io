-- ============================================================
-- حماية جدول الشفتات: القراءة للجميع، الكتابة بالمشرف فقط
-- جدول: public.schedule  |  كود المشرف: 6397
-- نفّذ هذا الملف كاملاً في Supabase ← SQL Editor ← Run
-- آمن للتشغيل أكثر من مرة.
-- ============================================================

-- 1) تأمين الجدول: تفعيل حماية الصفوف
alter table public.schedule enable row level security;

-- 2) إزالة أي سياسات سابقة
drop policy if exists "read_schedule_all" on public.schedule;
drop policy if exists "write_schedule_anon" on public.schedule;
drop policy if exists "write_schedule_anon_upsert" on public.schedule;

-- 3) السماح بالقراءة لأي زائر (anon + authenticated)
create policy "read_schedule_all"
  on public.schedule for select
  to anon, authenticated
  using (true);

-- ملحوظة: لا توجد أي سياسة إدخال/تعديل/حذف على الجدول نهائياً،
-- فالكتابة المباشرة من المتصفح (anon) سترفضها قاعدة البيانات.

-- 4) سحب صلاحيات الكتابة المباشرة من المفتاح العام (anon)
revoke insert, update, delete on public.schedule from anon;
revoke insert, update, delete on public.schedule from authenticated;

-- 5) الدالة الآمنة: الوحيدة القادرة على الكتابة — تتحقق من الكود
--    الكود مخزّن داخل الدالة في السيرفر فقط، ولا يظهر في كود الموقع.
create or replace function public.save_schedule(p_pin text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_pin is null or p_pin <> '6397' then
    raise exception 'invalid pin';
  end if;

  insert into public.schedule (id, data, updated_at)
  values (1, p_data, now())
  on conflict (id) do update
    set data = excluded.data,
        updated_at = now();

  return true;
exception
  when others then
    return false;
end;
$$;

-- 6) السماح للزائرين باستدعاء الدالة (ستتحقق هي من الكود بنفسها)
grant execute on function public.save_schedule(text, jsonb) to anon, authenticated;

-- تم.
