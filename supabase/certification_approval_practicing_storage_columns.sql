-- Optional metadata fields for storing generated practicing certificate location.
-- The app can run without these columns, but when present it will persist path/URL.
ALTER TABLE public.certification_approval
  ADD COLUMN IF NOT EXISTS practicing_certificate_path varchar(255),
  ADD COLUMN IF NOT EXISTS practicing_certificate_url text;

