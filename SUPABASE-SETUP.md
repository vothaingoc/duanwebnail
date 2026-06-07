# Golyn Nail Supabase CMS setup

## 1. Tao Supabase project

1. Vao Supabase Dashboard va tao project moi.
2. Mo `SQL Editor`.
3. Copy toan bo noi dung trong `supabase-schema.sql` va chay.

Schema nay tao:

- `articles`: bai viet cho `news.html` va `article.html`.
- `gallery_items`: danh sach anh cho `index.html` va `gallery.html`.
- `cms_admins`: danh sach user duoc phep quan tri CMS.
- Storage bucket `golyn-media`: noi luu anh upload.
- RLS policies: public chi doc du lieu can hien thi, admin dang nhap moi duoc them/sua/xoa.

## 2. Tao tai khoan admin

1. Trong Supabase Dashboard, vao `Authentication > Users`.
2. Tao user bang email/password.
3. Copy UUID cua user do.
4. Chay cau SQL nay trong SQL Editor, thay UUID bang UUID that:

```sql
insert into public.cms_admins (user_id)
values ('00000000-0000-0000-0000-000000000000');
```

## 3. Dien config vao website

Mo `assets/js/supabase-config.js` va dien:

```js
window.GOLYN_SUPABASE = {
  url: "https://YOUR_PROJECT_ID.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
  mediaBucket: "golyn-media"
};
```

`anonKey` co the nam tren frontend neu RLS da bat dung cach. Khong dua `service_role` key vao website.

## 4. Mo CMS

Mo:

```text
cms-supabase.html
```

Dang nhap bang email/password admin da tao. Tu day co the:

- Upload anh vao Supabase Storage.
- Them/sua/xoa bai viet.
- Them/sua/xoa gallery.
- Chon anh featured de hien o trang chu.

## 5. Cach website lay du lieu

Website se uu tien Supabase neu da cau hinh. Neu chua cau hinh, website van dung du lieu local trong:

- `assets/js/articles-data.js`
- `assets/js/gallery-data.js`

Dieu nay giup website khong bi hong trong luc setup hoac khi Supabase tam thoi loi.
