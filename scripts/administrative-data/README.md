# Administrative data tooling

`normalize.mjs` converts the reviewed JSON extraction of the signed Quyết định 19/2025/QĐ-TTg into deterministic, checksummed resources. The validator includes the official Ia Mơ correction (`23938`) and rejects the retired erroneous code (`23737`). The source PDF is not fetched at application runtime.

```powershell
node scripts/administrative-data/normalize.mjs `
  --input=.tmp/official-communes.json `
  --output=backend/src/main/resources/administrative-data/vn-administrative-units-2025-07-01 `
  --raw-sha256=f83055f528bf320f5546b6e62aa5cf58abe8f3594f95c9d04f82732c3c682b69
```

The command fails unless it sees exactly 34 province-level units and 3,321 commune-level units (2,621 communes, 687 wards, and 13 special zones), unique official codes, valid parents, and NFC Vietnamese names.
