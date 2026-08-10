-- Rich-text article body. The admin editor produces formatted HTML (with
-- paste-from-Word/web support), sanitized server-side before storage. Detail
-- pages render body_html when present, falling back to body_markdown for
-- older resources.

alter table resources add column if not exists body_html text;
