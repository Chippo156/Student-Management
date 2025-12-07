import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

/**
 * SearchableAutocomplete - Component tái sử dụng cho việc chọn với search
 *
 * @param {Array} options - Danh sách các option để chọn
 * @param {*} value - Giá trị hiện tại (object hoặc array nếu multiple)
 * @param {Function} onChange - Callback khi thay đổi giá trị (newValue) => void
 * @param {Function} getOptionLabel - Function để lấy label từ option (option) => string
 * @param {string} label - Label hiển thị
 * @param {string} placeholder - Placeholder text
 * @param {boolean} loading - Trạng thái loading
 * @param {boolean} required - Bắt buộc chọn hay không
 * @param {boolean} disabled - Disable component
 * @param {boolean} multiple - Cho phép chọn nhiều
 * @param {string} noOptionsText - Text hiển thị khi không có option
 * @param {Function} renderOption - Custom render cho từng option (props, option) => ReactNode
 * @param {Function} renderTags - Custom render cho tags (multiple mode) (value, getTagProps) => ReactNode
 * @param {string} size - Kích thước ('small', 'medium')
 * @param {string} error - Error message
 * @param {string} helperText - Helper text
 * @param {Object} sx - Style override
 * @param {Function} isOptionEqualToValue - Function để so sánh option (option, value) => boolean
 * @param {boolean} showSearchIcon - Hiển thị icon search
 * @param {number} limitTags - Giới hạn số tags hiển thị (multiple mode)
 * @param {boolean} disableClearable - Không cho phép clear
 */
const SearchableAutocomplete = ({
  options = [],
  value,
  onChange,
  getOptionLabel,
  label,
  placeholder = 'Tìm kiếm...',
  loading = false,
  required = false,
  disabled = false,
  multiple = false,
  noOptionsText = 'Không tìm thấy kết quả',
  renderOption,
  renderTags,
  size = 'medium',
  error = false,
  helperText = '',
  sx = {},
  isOptionEqualToValue,
  showSearchIcon = true,
  limitTags = 2,
  disableClearable = false,
  ...otherProps
}) => {
  // Sanitize options to remove any React properties
  const sanitizedOptions = React.useMemo(() => {
    try {
      // Debug: Check if options contain invalid data
      if (process.env.NODE_ENV === 'development') {
        options.forEach((option, index) => {
          if (typeof option === 'object' && option !== null) {
            if (option.__reactFiber || option.__reactInternalInstance) {
              console.warn(
                'React fiber node detected in options at index:',
                index
              );
            }
          }
        });
      }

      const safeOptions = options.map((option) => {
        if (typeof option === 'string' || typeof option === 'number') {
          return { value: option, label: option.toString() };
        }

        // Keep all original properties, just remove React internals
        const cleanOption = {};
        for (const key in option) {
          // Only skip React-specific properties, keep all others including those starting with '_'
          if (
            !key.startsWith('__react') &&
            typeof option[key] !== 'function' &&
            key !== '_owner' &&
            key !== '_store'
          ) {
            cleanOption[key] = option[key];
          }
        }

        return cleanOption;
      });

      return safeOptions;
    } catch (error) {
      console.error('Error sanitizing options:', error);
      return [];
    }
  }, [options]);

  // Sanitize value prop to remove any React properties
  const sanitizedValue = React.useMemo(() => {
    if (!value) return null;

    try {
      if (Array.isArray(value)) {
        return value.map((item) => {
          if (typeof item === 'string' || typeof item === 'number') {
            return { value: item, label: item.toString() };
          }
          // Keep all original properties, just remove React internals
          const cleanValue = {};
          for (const key in item) {
            // Only skip React-specific properties, keep all others including those starting with '_'
            if (
              !key.startsWith('__react') &&
              typeof item[key] !== 'function' &&
              key !== '_owner' &&
              key !== '_store'
            ) {
              cleanValue[key] = item[key];
            }
          }
          return cleanValue;
        });
      } else {
        if (typeof value === 'string' || typeof value === 'number') {
          return { value: value, label: value.toString() };
        }
        // Keep all original properties, just remove React internals
        const cleanValue = {};
        for (const key in value) {
          // Only skip React-specific properties, keep all others including those starting with '_'
          if (
            !key.startsWith('__react') &&
            typeof value[key] !== 'function' &&
            key !== '_owner' &&
            key !== '_store'
          ) {
            cleanValue[key] = value[key];
          }
        }
        return cleanValue;
      }
    } catch (error) {
      console.error('Error sanitizing value:', error);
      return null;
    }
  }, [value]);

  // Default getOptionLabel function
  const defaultGetOptionLabel = (option) => {
    if (!option) return '';

    try {
      if (typeof option === 'string') return option;
      if (typeof option === 'number') return option.toString();
      return option.label || option.name || 'Unknown option';
    } catch (error) {
      console.warn('Error getting option label:', error);
      return 'Option';
    }
  };

  // Default isOptionEqualToValue function
  const defaultIsOptionEqualToValue = (option, value) => {
    if (!option && !value) return true;
    if (!option || !value) return false;

    // Try different ways to compare
    if (option.id && value.id) return option.id === value.id;
    if (option.value && value.value) return option.value === value.value;
    if (option.name && value.name) return option.name === value.name;

    // Last resort: string comparison
    return defaultGetOptionLabel(option) === defaultGetOptionLabel(value);
  };

  // Default renderOption nếu không được cung cấp
  const defaultRenderOption = (props, option) => {
    // Generate unique key without circular reference
    const generateKey = (opt) => {
      try {
        if (opt && opt.id) return `id-${opt.id}`;
        if (opt && opt.value) return `value-${opt.value}`;
        if (opt && opt.name) return `name-${opt.name}`;
        return `key-${Math.random().toString(36).substr(2, 9)}`;
      } catch (error) {
        return `key-${Math.random().toString(36).substr(2, 9)}`;
      }
    };

    return (
      <li {...props} key={generateKey(option)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography variant="body2">
            {getOptionLabel
              ? getOptionLabel(option)
              : defaultGetOptionLabel(option)}
          </Typography>
        </Box>
      </li>
    );
  };

  // Default renderTags cho multiple mode
  const defaultRenderTags = (value, getTagProps) =>
    value.map((option, index) => {
      const generateKey = (opt) => {
        try {
          if (opt && opt.id) return `id-${opt.id}`;
          if (opt && opt.value) return `value-${opt.value}`;
          if (opt && opt.name) return `name-${opt.name}`;
          return `key-${index}-${Math.random().toString(36).substr(2, 9)}`;
        } catch (error) {
          return `key-${index}-${Math.random().toString(36).substr(2, 9)}`;
        }
      };

      return (
        <Chip
          {...getTagProps({ index })}
          key={generateKey(option)}
          label={
            getOptionLabel
              ? getOptionLabel(option)
              : defaultGetOptionLabel(option)
          }
          size="small"
        />
      );
    });

  try {
    return (
      <Autocomplete
        options={sanitizedOptions}
        value={sanitizedValue}
        style={{ padding: 0 }}
        onChange={(event, newValue) => {
          // Only pass newValue to avoid circular reference issues with event object
          onChange && onChange(newValue);
        }}
        getOptionLabel={getOptionLabel || defaultGetOptionLabel}
        isOptionEqualToValue={
          isOptionEqualToValue || defaultIsOptionEqualToValue
        }
        loading={loading}
        disabled={disabled}
        multiple={multiple}
        noOptionsText={noOptionsText}
        limitTags={limitTags}
        disableClearable={disableClearable}
        sx={{
          '& .MuiAutocomplete-inputRoot': {
            paddingTop: 0,
            minHeight: 40,
            paddingBottom: 0,
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiInputBase-root': {
            paddingTop: 0,
            paddingBottom: 0,
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiOutlinedInput-root': {
            paddingTop: 0,
            paddingBottom: 0,
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiInputBase-input': {
            paddingTop: '0 !important',
            paddingBottom: '0 !important',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiAutocomplete-endAdornment': {
            top: '50%',
            transform: 'translateY(-50%)',
          },
          ...sx,
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            size={size}
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              startAdornment: showSearchIcon ? (
                <>
                  <SearchIcon
                    sx={{ ml: 1, mr: -0.5, color: 'action.active' }}
                  />
                  {params.InputProps.startAdornment}
                </>
              ) : (
                params.InputProps.startAdornment
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={renderOption || defaultRenderOption}
        renderTags={renderTags || defaultRenderTags}
        {...otherProps}
      />
    );
  } catch (error) {
    console.error('SearchableAutocomplete error:', error);

    // Fallback to basic TextField
    return (
      <TextField
        label={label}
        placeholder={placeholder}
        size={size}
        error={true}
        helperText="Có lỗi xảy ra"
        disabled={disabled}
        InputProps={{
          startAdornment: showSearchIcon ? (
            <SearchIcon sx={{ ml: 1, mr: 1, color: 'action.active' }} />
          ) : null,
        }}
        sx={sx}
      />
    );
  }
};

export default React.memo(SearchableAutocomplete);
