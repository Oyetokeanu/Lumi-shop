create table products (id uuid primary key default gen_random_uuid(), name text not null, category text not null, description text, price_kobo integer not null check (price_kobo > 0), created_at timestamptz default now());
create table orders (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users, email text not null, name text not null, phone text, address text not null, total_kobo integer not null, status text not null default 'pending', created_at timestamptz default now(), paid_at timestamptz);
create table order_items (id uuid primary key default gen_random_uuid(), order_id uuid references orders on delete cascade, product_id uuid references products, name text not null, unit_kobo integer not null, qty integer not null check (qty > 0));
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
create policy "public read products" on products for select using (true);
create policy "own orders" on orders for select using (auth.uid() = user_id);
create policy "own order items" on order_items for select using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
insert into products (name, category, description, price_kobo) values
('Shea Butter Day Cream','Cream','Light daily moisture with SPF-friendly base.',850000),
('Overnight Repair Cream','Cream','Rich night cream for dry, tired skin.',1200000),
('Oud Noir Eau de Parfum','Perfume','Warm oud with amber and vanilla. 50ml.',2800000),
('Jasmine Bloom Perfume','Perfume','Soft white florals for everyday wear. 50ml.',2200000),
('Cocoa Body Lotion','Body lotion','Deep hydration with cocoa butter. 400ml.',650000),
('Aloe Glow Body Lotion','Body lotion','Fast-absorbing, non-greasy. 400ml.',600000);
