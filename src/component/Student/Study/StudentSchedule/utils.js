export const getTypeLabel = (type) => {
  switch (type) {
    case 'class':
      return 'Lý thuyết';
    case 'assignment':
      return 'Thực hành';
    case 'exam':
      return 'Thi';
    default:
      return '';
  }
};

export const getPeriodFromTime = (time) => {
  if (!time) return 'morning';
  const first = time.split('-')[0].trim();
  const hh = parseInt(first.split(':')[0], 10);
  if (isNaN(hh)) return 'morning';
  if (hh < 12) return 'morning';
  if (hh < 18) return 'afternoon';
  return 'evening';
};

export const getEventColor = (item, theme, alpha) => {
  const isDark = theme.palette.mode === 'dark';
  switch (item.type) {
    case 'class':
      return isDark
        ? alpha(theme.palette.primary.main, 0.2)
        : alpha(theme.palette.primary.main, 0.08);
    case 'assignment':
      return isDark
        ? alpha(theme.palette.success.main, 0.2)
        : alpha(theme.palette.success.main, 0.08);
    case 'exam':
      return isDark
        ? alpha(theme.palette.warning.main, 0.2)
        : alpha(theme.palette.warning.main, 0.08);
    default:
      return theme.palette.background.default;
  }
};

export const getEventBorderColor = (item, theme) => {
  switch (item.type) {
    case 'class':
      return theme.palette.primary.main;
    case 'assignment':
      return theme.palette.success.main;
    case 'exam':
      return theme.palette.warning.main;
    default:
      return theme.palette.divider;
  }
};

export const getTypeColor = (type, theme) => {
  switch (type) {
    case 'class':
      return theme.palette.primary.main;
    case 'assignment':
      return theme.palette.success.main;
    case 'exam':
      return theme.palette.warning.main;
    default:
      return theme.palette.text.disabled;
  }
};
