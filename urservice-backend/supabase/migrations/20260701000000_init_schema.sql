-- =====================================================================
-- 1. Create Enums & Types
-- =====================================================================

create type public.user_role as enum ('client', 'vendor', 'admin');

create type public.verification_status as enum ('pending', 'under_review', 'approved', 'rejected', 'suspended');

create type public.document_category as enum ('identity', 'business_proof', 'bank_proof');

create type public.document_verification_status as enum ('pending', 'approved', 'rejected');

create type public.booking_status as enum ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- =====================================================================
-- 2. Create Tables
-- =====================================================================

-- Users table (linked to auth.users)
create table public.users (
    id uuid references auth.users on delete cascade primary key,
    role public.user_role not null default 'client',
    email text not null,
    created_at timestamptz not null default now()
);

-- Profiles table
create table public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade unique not null,
    full_name text not null,
    phone text,
    city text,
    profile_photo_url text,
    created_at timestamptz not null default now()
);

-- Vendors table
create table public.vendors (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade unique not null,
    business_name text not null,
    business_category text not null,
    business_description text,
    years_experience integer not null check (years_experience >= 0),
    service_radius_km integer not null check (service_radius_km >= 0),
    date_of_birth date not null,
    gender text not null,
    house_number text,
    street text,
    area text,
    city text not null,
    state text not null,
    pincode text not null,
    latitude numeric,
    longitude numeric,
    business_logo_url text,
    verification_status public.verification_status not null default 'pending',
    rejection_reason text,
    suspension_reason text,
    working_days text[] not null default '{}'::text[],
    working_hours_start time not null,
    working_hours_end time not null,
    emergency_availability boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Vendor Documents table
create table public.vendor_documents (
    id uuid primary key default gen_random_uuid(),
    vendor_id uuid references public.vendors(id) on delete cascade not null,
    document_type text not null,
    document_category public.document_category not null,
    file_url text not null,
    verification_status public.document_verification_status not null default 'pending',
    remarks text,
    uploaded_at timestamptz not null default now()
);

-- Vendor Bank Details table
create table public.vendor_bank_details (
    id uuid primary key default gen_random_uuid(),
    vendor_id uuid references public.vendors(id) on delete cascade unique not null,
    account_holder_name text not null,
    bank_name text not null,
    account_number text not null,
    ifsc_code text not null,
    upi_id text
);

-- Notifications table
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    title text not null,
    message text not null,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

-- Services table
create table public.services (
    id uuid primary key default gen_random_uuid(),
    vendor_id uuid references public.vendors(id) on delete cascade not null,
    name text not null,
    description text,
    price numeric not null check (price >= 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Bookings table
create table public.bookings (
    id uuid primary key default gen_random_uuid(),
    client_id uuid references public.users(id) on delete cascade not null,
    vendor_id uuid references public.vendors(id) on delete cascade not null,
    service_id uuid references public.services(id) on delete cascade not null,
    status public.booking_status not null default 'requested',
    scheduled_at timestamptz not null,
    created_at timestamptz not null default now()
);

-- =====================================================================
-- 3. Create Indexes
-- =====================================================================

create index idx_vendors_verification_status on public.vendors(verification_status);
create index idx_vendors_city on public.vendors(city);
create index idx_vendor_documents_vendor_id on public.vendor_documents(vendor_id);
create index idx_notifications_user_id_is_read on public.notifications(user_id, is_read);
create index idx_bookings_vendor_id on public.bookings(vendor_id);
create index idx_bookings_client_id on public.bookings(client_id);

-- =====================================================================
-- 4. Triggers & Automated Columns
-- =====================================================================

-- Auto-update updated_at for vendors
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trigger_update_vendors_updated_at
    before update on public.vendors
    for each row execute procedure public.update_updated_at_column();

-- Sync auth.users to public.users on creation
create or replace function public.handle_new_user()
returns trigger as $$
declare
    user_role_val public.user_role;
begin
    begin
        user_role_val := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role);
    exception when others then
        user_role_val := 'client'::public.user_role;
    end;

    insert into public.users (id, role, email)
    values (new.id, user_role_val, coalesce(new.email, ''));
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- =====================================================================
-- 5. Helper Functions & Security Helpers
-- =====================================================================

create or replace function public.is_admin()
returns boolean as $$
begin
    return exists (
        select 1 from public.users
        where id = auth.uid() and role = 'admin'::public.user_role
    );
end;
$$ language plpgsql security definer;

-- =====================================================================
-- 6. Row Level Security (RLS) & Policies
-- =====================================================================

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_documents enable row level security;
alter table public.vendor_bank_details enable row level security;
alter table public.notifications enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Policies for public.users
create policy "Users can select their own user row" on public.users
    for select using (auth.uid() = id);

create policy "Users can update their own user row" on public.users
    for update using (auth.uid() = id);

create policy "Admins can do everything on users" on public.users
    for all using (public.is_admin());

-- Policies for public.profiles
create policy "Users can select their own profile" on public.profiles
    for select using (auth.uid() = user_id);

create policy "Users can insert their own profile" on public.profiles
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = user_id);

create policy "Users can delete their own profile" on public.profiles
    for delete using (auth.uid() = user_id);

create policy "Admins can do everything on profiles" on public.profiles
    for all using (public.is_admin());

-- Policies for public.vendors
create policy "Public read approved vendors" on public.vendors
    for select using (verification_status = 'approved');

create policy "Vendors can select their own vendor profile" on public.vendors
    for select using (auth.uid() = user_id);

create policy "Vendors can insert their own vendor profile" on public.vendors
    for insert with check (auth.uid() = user_id);

create policy "Vendors can update their own vendor profile" on public.vendors
    for update using (auth.uid() = user_id);

create policy "Admins can do everything on vendors" on public.vendors
    for all using (public.is_admin());

-- Policies for public.vendor_documents
create policy "Vendors can select their own documents" on public.vendor_documents
    for select using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can insert their own documents" on public.vendor_documents
    for insert with check (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can update their own documents" on public.vendor_documents
    for update using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can delete their own documents" on public.vendor_documents
    for delete using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Admins can do everything on vendor documents" on public.vendor_documents
    for all using (public.is_admin());

-- Policies for public.vendor_bank_details
create policy "Vendors can select their own bank details" on public.vendor_bank_details
    for select using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can insert their own bank details" on public.vendor_bank_details
    for insert with check (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can update their own bank details" on public.vendor_bank_details
    for update using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can delete their own bank details" on public.vendor_bank_details
    for delete using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Admins can do everything on bank details" on public.vendor_bank_details
    for all using (public.is_admin());

-- Policies for public.notifications
create policy "Users can select their own notifications" on public.notifications
    for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
    for update using (auth.uid() = user_id);

create policy "Users can delete their own notifications" on public.notifications
    for delete using (auth.uid() = user_id);

-- Policies for public.services
create policy "Public read active services of approved vendors" on public.services
    for select using (
        is_active = true and exists (
            select 1 from public.vendors v where v.id = vendor_id and v.verification_status = 'approved'
        )
    );

create policy "Vendors can select their own services" on public.services
    for select using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can insert their own services" on public.services
    for insert with check (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can update their own services" on public.services
    for update using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can delete their own services" on public.services
    for delete using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Admins can do everything on services" on public.services
    for all using (public.is_admin());

-- Policies for public.bookings
create policy "Clients can select their own bookings" on public.bookings
    for select using (client_id = auth.uid());

create policy "Clients can insert their own bookings" on public.bookings
    for insert with check (client_id = auth.uid());

create policy "Clients can update their own bookings" on public.bookings
    for update using (client_id = auth.uid());

create policy "Vendors can select their own bookings" on public.bookings
    for select using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Vendors can update their own bookings" on public.bookings
    for update using (exists (
        select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()
    ));

create policy "Admins can do everything on bookings" on public.bookings
    for all using (public.is_admin());

-- =====================================================================
-- 7. Storage Buckets Setup & Policies
-- =====================================================================

-- Insert bucket definitions into storage.buckets if they do not exist
insert into storage.buckets (id, name, public)
values 
    ('profile-images', 'profile-images', false),
    ('vendor-identity', 'vendor-identity', false),
    ('vendor-business-documents', 'vendor-business-documents', false),
    ('vendor-logos', 'vendor-logos', false)
on conflict (id) do nothing;

-- Set up RLS policies on storage.objects for each bucket

-- Policy for profile-images
create policy "Owner read own profile image" on storage.objects
    for select using (bucket_id = 'profile-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create policy "Owner insert own profile image" on storage.objects
    for insert with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner update own profile image" on storage.objects
    for update using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner delete own profile image" on storage.objects
    for delete using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);


-- Policy for vendor-identity
create policy "Owner read own vendor identity" on storage.objects
    for select using (bucket_id = 'vendor-identity' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create policy "Owner insert own vendor identity" on storage.objects
    for insert with check (bucket_id = 'vendor-identity' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner update own vendor identity" on storage.objects
    for update using (bucket_id = 'vendor-identity' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner delete own vendor identity" on storage.objects
    for delete using (bucket_id = 'vendor-identity' and (storage.foldername(name))[1] = auth.uid()::text);


-- Policy for vendor-business-documents
create policy "Owner read own business documents" on storage.objects
    for select using (bucket_id = 'vendor-business-documents' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create policy "Owner insert own business documents" on storage.objects
    for insert with check (bucket_id = 'vendor-business-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner update own business documents" on storage.objects
    for update using (bucket_id = 'vendor-business-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner delete own business documents" on storage.objects
    for delete using (bucket_id = 'vendor-business-documents' and (storage.foldername(name))[1] = auth.uid()::text);


-- Policy for vendor-logos
create policy "Owner read own vendor logo" on storage.objects
    for select using (bucket_id = 'vendor-logos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create policy "Owner insert own vendor logo" on storage.objects
    for insert with check (bucket_id = 'vendor-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner update own vendor logo" on storage.objects
    for update using (bucket_id = 'vendor-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner delete own vendor logo" on storage.objects
    for delete using (bucket_id = 'vendor-logos' and (storage.foldername(name))[1] = auth.uid()::text);
