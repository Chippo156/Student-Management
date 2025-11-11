export const getTypeLabel = (type) => {
  switch (type) {
    case 'theory':
      return 'Lý thuyết';
    case 'practice':
      return 'Thực hành';
    default:
      return 'Khác';
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
    case 'theory':
      return isDark
        ? alpha(theme.palette.primary.main, 0.2)
        : alpha(theme.palette.primary.main, 0.08);
    case 'practice':
      return isDark
        ? alpha(theme.palette.success.main, 0.2)
        : alpha(theme.palette.success.main, 0.08);
    default:
      return theme.palette.background.default;
  }
};

export const getEventBorderColor = (item, theme) => {
  switch (item.type) {
    case 'theory':
      return theme.palette.primary.main;
    case 'practice':
      return theme.palette.success.main;
    default:
      return theme.palette.divider;
  }
};

export const getTypeColor = (type, theme) => {
  switch (type) {
    case 'theory':
      return theme.palette.primary.main;
    case 'practice':
      return theme.palette.success.main;
    default:
      return theme.palette.text.disabled;
  }
};
