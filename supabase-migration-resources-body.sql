-- Allow resources to have a markdown body instead of (or in addition to) a
-- PDF file. This lets the content portal handle articles — partners can paste
-- markdown directly without uploading a file.
--
-- Each resource now has:
--   - pdf_path     (nullable) — for downloadable playbooks/workbooks/templates
--   - body_markdown (nullable) — for in-app rendered articles/guides
--
-- The form on /admin/resources/new requires at least one of the two:
-- "article" / "guide" types use body_markdown; everything else uses pdf_path.

alter table resources
  add column if not exists body_markdown text;

-- pdf_path was already nullable in the original schema (the column was
-- created with no NOT NULL constraint); this is a no-op for safety in case
-- it was added later.
alter table resources
  alter column pdf_path drop not null;
