import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  List,
  Portal,
  Dialog,
  Button,
  Text,
  Chip,
  Searchbar,
  useTheme,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';

/**
 * SearchableAutocomplete - React Native component for searchable dropdown
 *
 * @param {Array} options - List of options to choose from
 * @param {*} value - Current value (object or array if multiple)
 * @param {Function} onChange - Callback when value changes (newValue) => void
 * @param {Function} getOptionLabel - Function to get label from option (option) => string
 * @param {string} label - Label to display
 * @param {string} placeholder - Placeholder text
 * @param {boolean} loading - Loading state
 * @param {boolean} required - Required field
 * @param {boolean} disabled - Disable component
 * @param {boolean} multiple - Allow multiple selection
 * @param {string} noOptionsText - Text when no options available
 * @param {string} size - Size ('small', 'medium')
 * @param {boolean} error - Error state
 * @param {string} helperText - Helper text
 * @param {Object} style - Style override
 * @param {Function} isOptionEqualToValue - Function to compare options
 * @param {boolean} showSearchIcon - Show search icon
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
  size = 'medium',
  error = false,
  helperText = '',
  style = {},
  isOptionEqualToValue,
  showSearchIcon = true,
  ...otherProps
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Default getOptionLabel function
  const defaultGetOptionLabel = (option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    if (typeof option === 'number') return option.toString();
    return option.label || option.name || 'Unknown option';
  };

  const labelGetter = getOptionLabel || defaultGetOptionLabel;

  // Default isOptionEqualToValue function
  const defaultIsOptionEqualToValue = (option, val) => {
    if (!option && !val) return true;
    if (!option || !val) return false;

    // Try different ways to compare
    if (option.id && val.id) return option.id === val.id;
    if (option.value && val.value) return option.value === val.value;
    if (option.name && val.name) return option.name === val.name;

    return labelGetter(option) === labelGetter(val);
  };

  const equalityChecker = isOptionEqualToValue || defaultIsOptionEqualToValue;

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;

    return options.filter((option) => {
      const label = labelGetter(option).toLowerCase();
      return label.includes(searchQuery.toLowerCase());
    });
  }, [options, searchQuery, labelGetter]);

  // Get display text
  const getDisplayText = () => {
    if (!value) return '';

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return '';
      if (value.length === 1) return labelGetter(value[0]);
      return `${value.length} mục đã chọn`;
    }

    return labelGetter(value);
  };

  // Handle option selection
  const handleSelect = (option) => {
    if (multiple) {
      const currentValue = value || [];
      const exists = currentValue.some((item) =>
        equalityChecker(item, option)
      );

      let newValue;
      if (exists) {
        newValue = currentValue.filter(
          (item) => !equalityChecker(item, option)
        );
      } else {
        newValue = [...currentValue, option];
      }

      onChange && onChange(newValue);
    } else {
      onChange && onChange(option);
      setVisible(false);
      setSearchQuery('');
    }
  };

  // Check if option is selected
  const isSelected = (option) => {
    if (!value) return false;

    if (multiple && Array.isArray(value)) {
      return value.some((item) => equalityChecker(item, option));
    }

    return equalityChecker(value, option);
  };

  // Handle remove chip (multiple mode)
  const handleRemoveChip = (option) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter((item) => !equalityChecker(item, option));
      onChange && onChange(newValue);
    }
  };

  // Clear selection
  const handleClear = () => {
    onChange && onChange(multiple ? [] : null);
  };

  const renderItem = ({ item }) => (
    <List.Item
      title={labelGetter(item)}
      onPress={() => handleSelect(item)}
      right={() =>
        isSelected(item) ? (
          <List.Icon icon="check" color={theme.colors.primary} />
        ) : null
      }
      style={[
        styles.listItem,
        isSelected(item) && {
          backgroundColor: theme.colors.primaryContainer,
        },
      ]}
    />
  );

  return (
    <View style={[styles.container, style]}>
      {/* Input Field */}
      <TouchableOpacity
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <TextInput
          label={label}
          placeholder={placeholder}
          value={getDisplayText()}
          editable={false}
          mode="outlined"
          error={error}
          disabled={disabled}
          right={
            loading ? (
              <TextInput.Icon icon={() => <ActivityIndicator size={20} />} />
            ) : value && !disabled ? (
              <TextInput.Icon icon="close" onPress={handleClear} />
            ) : (
              <TextInput.Icon icon="chevron-down" />
            )
          }
          left={
            showSearchIcon ? <TextInput.Icon icon="magnify" /> : undefined
          }
          pointerEvents="none"
        />
      </TouchableOpacity>

      {/* Helper Text */}
      {helperText ? (
        <Text
          variant="bodySmall"
          style={[
            styles.helperText,
            error && { color: theme.colors.error },
          ]}
        >
          {helperText}
        </Text>
      ) : null}

      {/* Selected Items (Multiple Mode) */}
      {multiple && value && Array.isArray(value) && value.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
        >
          {value.map((item, index) => (
            <Chip
              key={index}
              onClose={() => !disabled && handleRemoveChip(item)}
              style={styles.chip}
              disabled={disabled}
            >
              {labelGetter(item)}
            </Chip>
          ))}
        </ScrollView>
      )}

      {/* Options Dialog */}
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => {
            setVisible(false);
            setSearchQuery('');
          }}
          style={styles.dialog}
        >
          <Dialog.Title>{label || 'Chọn'}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {/* Search Bar */}
            <Searchbar
              placeholder={placeholder}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />

            {/* Options List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
              </View>
            ) : filteredOptions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text variant="bodyMedium">{noOptionsText}</Text>
              </View>
            ) : (
              <FlatList
                data={filteredOptions}
                renderItem={renderItem}
                keyExtractor={(item, index) => {
                  if (item && item.id) return `id-${item.id}`;
                  if (item && item.value) return `value-${item.value}`;
                  return `index-${index}`;
                }}
                ItemSeparatorComponent={() => <Divider />}
                style={styles.list}
              />
            )}
          </Dialog.Content>

          {/* Actions */}
          {multiple && (
            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Đóng</Button>
            </Dialog.Actions>
          )}
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 12,
  },
  chipsContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    padding: 16,
    maxHeight: 500,
  },
  searchBar: {
    marginBottom: 16,
  },
  list: {
    maxHeight: 400,
  },
  listItem: {
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(SearchableAutocomplete);
