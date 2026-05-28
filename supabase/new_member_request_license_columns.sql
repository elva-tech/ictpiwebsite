-- Run in Supabase SQL editor before deploying registration license fields.
ALTER TABLE new_member_request
  ADD COLUMN IF NOT EXISTS itp_enrollment_number varchar(100),
  ADD COLUMN IF NOT EXISTS gstp_enrollment_number varchar(100),
  ADD COLUMN IF NOT EXISTS itp_gstp_combined_enrollment varchar(100),
  ADD COLUMN IF NOT EXISTS stp_vat_enrollment_number varchar(100),
  ADD COLUMN IF NOT EXISTS cb_license_number varchar(100);
