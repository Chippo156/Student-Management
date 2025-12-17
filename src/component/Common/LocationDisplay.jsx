import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, CircularProgress, Tooltip } from '@mui/material';
import { Place as PlaceIcon } from '@mui/icons-material';

const LocationDisplay = ({ latitude, longitude, radius, compact = false }) => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      fetchAddress(latitude, longitude);
    }
  }, [latitude, longitude]);

  const fetchAddress = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      const data = await response.json();

      if (data.display_name) {
        // Rút gọn địa chỉ: lấy 3-4 phần đầu
        const addressParts = data.display_name.split(',').slice(0, 4);
        setAddress(addressParts.join(','));
      } else {
        setAddress('Không tìm thấy địa chỉ');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('');
    } finally {
      setLoading(false);
    }
  };

  if (!latitude || !longitude) {
    return null;
  }

  if (compact) {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="caption" display="block">
              {address || 'Đang tải địa chỉ...'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              Tọa độ: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Typography>
            {radius && (
              <Typography variant="caption" display="block">
                Bán kính: {radius}m
              </Typography>
            )}
          </Box>
        }
        arrow
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PlaceIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
            {loading ? 'Đang tải...' : address || 'Vị trí đã xác định'}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <PlaceIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.3 }} />
      <Box sx={{ flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Đang tìm địa chỉ...
            </Typography>
          </Box>
        ) : address ? (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {address}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
                size="small"
                variant="outlined"
              />
              {radius && (
                <Chip
                  label={`Bán kính: ${radius}m`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
            {radius && ` • Bán kính: ${radius}m`}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default LocationDisplay;
