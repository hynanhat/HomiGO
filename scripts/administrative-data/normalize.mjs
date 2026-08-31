import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const provinces = [
  ['01', 'Thành phố Hà Nội', 'CENTRAL_MUNICIPALITY'],
  ['04', 'Tỉnh Cao Bằng', 'PROVINCE'],
  ['08', 'Tỉnh Tuyên Quang', 'PROVINCE'],
  ['11', 'Tỉnh Điện Biên', 'PROVINCE'],
  ['12', 'Tỉnh Lai Châu', 'PROVINCE'],
  ['14', 'Tỉnh Sơn La', 'PROVINCE'],
  ['15', 'Tỉnh Lào Cai', 'PROVINCE'],
  ['19', 'Tỉnh Thái Nguyên', 'PROVINCE'],
  ['20', 'Tỉnh Lạng Sơn', 'PROVINCE'],
  ['22', 'Tỉnh Quảng Ninh', 'PROVINCE'],
  ['24', 'Tỉnh Bắc Ninh', 'PROVINCE'],
  ['25', 'Tỉnh Phú Thọ', 'PROVINCE'],
  ['31', 'Thành phố Hải Phòng', 'CENTRAL_MUNICIPALITY'],
  ['33', 'Tỉnh Hưng Yên', 'PROVINCE'],
  ['37', 'Tỉnh Ninh Bình', 'PROVINCE'],
  ['38', 'Tỉnh Thanh Hóa', 'PROVINCE'],
  ['40', 'Tỉnh Nghệ An', 'PROVINCE'],
  ['42', 'Tỉnh Hà Tĩnh', 'PROVINCE'],
  ['44', 'Tỉnh Quảng Trị', 'PROVINCE'],
  ['46', 'Thành phố Huế', 'CENTRAL_MUNICIPALITY'],
  ['48', 'Thành phố Đà Nẵng', 'CENTRAL_MUNICIPALITY'],
  ['51', 'Tỉnh Quảng Ngãi', 'PROVINCE'],
  ['52', 'Tỉnh Gia Lai', 'PROVINCE'],
  ['56', 'Tỉnh Khánh Hòa', 'PROVINCE'],
  ['66', 'Tỉnh Đắk Lắk', 'PROVINCE'],
  ['68', 'Tỉnh Lâm Đồng', 'PROVINCE'],
  ['75', 'Tỉnh Đồng Nai', 'PROVINCE'],
  ['79', 'Thành phố Hồ Chí Minh', 'CENTRAL_MUNICIPALITY'],
  ['80', 'Tỉnh Tây Ninh', 'PROVINCE'],
  ['82', 'Tỉnh Đồng Tháp', 'PROVINCE'],
  ['86', 'Tỉnh Vĩnh Long', 'PROVINCE'],
  ['91', 'Tỉnh An Giang', 'PROVINCE'],
  ['92', 'Thành phố Cần Thơ', 'CENTRAL_MUNICIPALITY'],
  ['96', 'Tỉnh Cà Mau', 'PROVINCE'],
].map(([code, name, type]) => ({ code, name, type, effectiveFrom: '2025-07-01' }))

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.split('=')
    return [key.replace(/^--/, ''), value.join('=')]
  }),
)
const inputPath = args.input
const outputDir = args.output
const rawSha256 = args['raw-sha256']
if (!inputPath || !outputDir || !/^[a-f0-9]{64}$/.test(rawSha256 ?? '')) {
  throw new Error('Usage: node normalize.mjs --input=<official-json> --output=<dir> --raw-sha256=<sha256>')
}

const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const json = (value) => `${JSON.stringify(value, null, 2)}\n`
const units = JSON.parse(await readFile(resolve(inputPath), 'utf8')).map((unit) => ({
  code: String(unit.code),
  provinceCode: String(unit.provinceCode),
  name: String(unit.name).normalize('NFC').replace(/\s+/gu, ' ').trim(),
  type: String(unit.type),
  effectiveFrom: '2025-07-01',
}))
units.sort((a, b) => a.provinceCode.localeCompare(b.provinceCode) || a.code.localeCompare(b.code))

const provinceCodes = new Set(provinces.map((province) => province.code))
const unitCodes = new Set(units.map((unit) => unit.code))
const typeCounts = Object.fromEntries(
  ['COMMUNE', 'WARD', 'SPECIAL_ZONE'].map((type) => [
    type,
    units.filter((unit) => unit.type === type).length,
  ]),
)
if (provinces.length !== 34 || units.length !== 3321 || unitCodes.size !== 3321) {
  throw new Error(`Invalid catalog counts: ${provinces.length} provinces, ${units.length} units, ${unitCodes.size} codes`)
}
if (typeCounts.COMMUNE !== 2621 || typeCounts.WARD !== 687 || typeCounts.SPECIAL_ZONE !== 13) {
  throw new Error(`Invalid unit type counts: ${JSON.stringify(typeCounts)}`)
}
const iaMo = units.find((unit) => unit.name === 'Xã Ia Mơ' && unit.provinceCode === '52')
if (iaMo?.code !== '23938' || units.some((unit) => unit.code === '23737')) {
  throw new Error('Invalid Ia Mơ correction: expected code 23938 and retired code 23737 absent')
}
for (const unit of units) {
  if (!/^\d{5}$/.test(unit.code)) throw new Error(`Invalid commune code: ${unit.code}`)
  if (!provinceCodes.has(unit.provinceCode)) throw new Error(`Orphan commune ${unit.code}`)
  if (!['COMMUNE', 'WARD', 'SPECIAL_ZONE'].includes(unit.type)) throw new Error(`Invalid type for ${unit.code}`)
  if (unit.name !== unit.name.normalize('NFC')) throw new Error(`Non-NFC name for ${unit.code}`)
}

const provinceJson = json(provinces)
const communeJson = json(units)
const normalizedSha256 = sha256(JSON.stringify({ provinces, communeUnits: units }))
const manifest = {
  datasetVersion: 'vn-administrative-units-2025-07-01',
  authority: 'Cục Thống kê',
  documentNumber: 'Quyết định 19/2025/QĐ-TTg ngày 30/06/2025',
  effectiveDate: '2025-07-01',
  retrievedAt: '2026-08-30T14:10:58Z',
  sourceUrls: [
    'https://www.nso.gov.vn/wp-content/uploads/2025/07/19_2025_qd-ttg_30062025-signed-6-143-da-nen.pdf',
    'https://www.nso.gov.vn/default/2025/07/quyet-dinh-ban-hanh-bang-danh-muc-va-ma-so-cac-don-vi-hanh-chinh-viet-nam/',
    'https://www.nso.gov.vn/wp-content/uploads/2025/06/CV-thong-bao-dieu-chinh-ma-so-don-vi-hanh-chinh-tinh-Gia-Lai-30.6.pdf',
  ],
  attribution: 'Bảng danh mục và mã số đơn vị hành chính Việt Nam ban hành kèm Quyết định 19/2025/QĐ-TTg.',
  transformVersion: 'homigo-qdt19-pdf-table-v1',
  rawSha256,
  normalizedSha256,
  provinceSha256: sha256(provinceJson),
  communeSha256: sha256(communeJson),
  expectedProvinceCount: 34,
  expectedCommuneCount: 3321,
  expectedTypeCounts: typeCounts,
}

await mkdir(resolve(outputDir), { recursive: true })
await Promise.all([
  writeFile(resolve(outputDir, 'provinces.json'), provinceJson, 'utf8'),
  writeFile(resolve(outputDir, 'commune-units.json'), communeJson, 'utf8'),
  writeFile(resolve(outputDir, 'manifest.json'), json(manifest), 'utf8'),
])
console.log(JSON.stringify({ ...manifest, outputDir: resolve(outputDir) }, null, 2))
