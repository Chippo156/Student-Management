// Chuẩn hóa dữ liệu {id, name} => {code, name}
export const normalizeList = (arr) =>
  Array.isArray(arr)
    ? arr.map((item) => ({
        code: item.id,
        name: item.name,
      }))
    : [];
