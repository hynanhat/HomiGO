import { z } from 'zod'

const optionalNonNegative = z.number().int().min(0).optional()
export const listingFormSchema = z.object({
  categoryId: z.number().int().positive('Vui lòng chọn danh mục.'),
  provinceCode: z.string().regex(/^\d{2}$/, 'Vui lòng chọn tỉnh/thành phố.'),
  communeCode: z.string().regex(/^\d{5}$/, 'Vui lòng chọn phường/xã/đặc khu.'),
  projectId: z.number().int().positive().optional(),
  title: z.string().trim().min(1, 'Vui lòng nhập tiêu đề.').max(200),
  description: z.string().trim().min(1, 'Vui lòng nhập mô tả.').max(10_000),
  price: z.number().positive('Giá phải lớn hơn 0.'),
  area: z.number().positive('Diện tích phải lớn hơn 0.'),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ.').max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  bedrooms: optionalNonNegative,
  bathrooms: optionalNonNegative,
  floors: optionalNonNegative,
  direction: z.string().max(50).optional(),
  furnishing: z.string().max(100).optional(),
  legalStatus: z.string().max(100).optional(),
  contactName: z.string().trim().min(1, 'Vui lòng nhập người liên hệ.').max(100),
  contactPhone: z.string().regex(/^[0-9+() .-]{8,20}$/, 'Số điện thoại không hợp lệ.'),
  version: z.number().int().min(0).optional(),
})
