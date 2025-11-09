// Danh sách loại quan hệ gia đình
export const RELATIONSHIP_TYPES = [
  { value: 1, label: 'Cha' },
  { value: 2, label: 'Mẹ' },
  { value: 3, label: 'Ông nội' },
  { value: 4, label: 'Bà nội' },
  { value: 5, label: 'Chú' },
  { value: 6, label: 'Cô' },
  { value: 7, label: 'Anh' },
  { value: 8, label: 'Chị' },
  { value: 9, label: 'Vợ/Chồng' },
  { value: 10, label: 'Giám hộ' },
  { value: 11, label: 'Khác' },
];

// Chuẩn hóa dữ liệu {id, name} => {code, name}
export const normalizeList = (arr) =>
  Array.isArray(arr)
    ? arr.map((item) => ({
        code: item.id,
        name: item.name,
      }))
    : [];
