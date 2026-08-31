# Administrative data artifact

This directory contains the immutable normalized artifact from signed Quyết định 19/2025/QĐ-TTg, effective 2025-07-01.

Required production files:

- `manifest.json`
- `provinces.json`
- `commune-units.json`

They are generated offline by `scripts/administrative-data/normalize.mjs`, reviewed, checksummed, and bundled with the backend. Production startup never fetches administrative data from the Internet. This clean-cutover release intentionally contains no legacy crosswalk because deployment is blocked unless `listings` and `projects` are empty.
