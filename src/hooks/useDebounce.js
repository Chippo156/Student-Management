import { useState, useEffect } from 'react';

/**
 * Custom hook để debounce giá trị
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (ms), mặc định 500ms
 * @returns {any} - Giá trị đã được debounce
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout để update giá trị sau khi delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout nếu value thay đổi trước khi hết delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook để debounce callback function
 * @param {Function} callback - Function cần debounce
 * @param {number} delay - Thời gian delay (ms), mặc định 500ms
 * @returns {Function} - Debounced function
 */
export const useDebouncedCallback = (callback, delay = 500) => {
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const debouncedCallback = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  return debouncedCallback;
};

export default useDebounce;
