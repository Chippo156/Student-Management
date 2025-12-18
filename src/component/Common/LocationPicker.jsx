import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Autocomplete,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  Map as MapIcon,
  Place as PlaceIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const LocationPicker = ({
  open,
  onClose,
  onSelect,
  initialPosition,
  radius = 50,
}) => {
  const [position, setPosition] = useState(
    initialPosition || { latitude: 10.762622, longitude: 106.660172 } // Default: TP.HCM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
      fetchAddress(initialPosition.latitude, initialPosition.longitude);
    }
  }, [initialPosition]);

  // Fetch address from coordinates using Nominatim API (OpenStreetMap)
  const fetchAddress = async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      const data = await response.json();

      if (data.display_name) {
        // Rút gọn địa chỉ cho dễ đọc
        const addressParts = data.display_name.split(',').slice(0, 4);
        setAddress(addressParts.join(','));
      } else {
        setAddress('Không tìm thấy địa chỉ');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('');
    } finally {
      setLoadingAddress(false);
    }
  };

  // Mapping từ viết tắt/tên gọi khác sang tên đầy đủ
  const expandQuery = (query) => {
    const lowerQuery = query.toLowerCase().trim();

    // Mapping các trường đại học phổ biến
    const universityMap = {
      iuh: 'Đại học Công nghiệp TP.HCM',
      đhcn: 'Đại học Công nghiệp',
      uit: 'Đại học Công nghệ Thông tin',
      dhcntt: 'Đại học Công nghệ Thông tin',
      hcmut: 'Đại học Bách Khoa',
      bk: 'Đại học Bách Khoa',
      dhbk: 'Đại học Bách Khoa',
      hcmus: 'Đại học Khoa học Tự nhiên',
      khtn: 'Đại học Khoa học Tự nhiên',
      ueh: 'Đại học Kinh tế',
      dhkt: 'Đại học Kinh tế',
      huflit: 'Đại học Ngoại ngữ Tin học',
      hcmute: 'Đại học Sư phạm Kỹ thuật',
      spkt: 'Đại học Sư phạm Kỹ thuật',
      hutech: 'Đại học Công nghệ TP.HCM',
      rmit: 'RMIT Vietnam',
      'ton duc thang': 'Đại học Tôn Đức Thắng',
      tdt: 'Đại học Tôn Đức Thắng',
      'van lang': 'Đại học Văn Lang',
      'hoa sen': 'Đại học Hoa Sen',
    };

    // Kiểm tra và mở rộng query
    for (const [key, value] of Object.entries(universityMap)) {
      if (lowerQuery === key || lowerQuery.startsWith(key + ' ')) {
        return query.replace(new RegExp(key, 'gi'), value);
      }
    }

    return query;
  };

  // Search address using Nominatim Search API
  const searchAddress = async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Mở rộng query với mapping
      let expandedQuery = expandQuery(query);

      // Thêm "Hồ Chí Minh" vào query để tăng độ chính xác cho địa chỉ trong TP.HCM
      const enhancedQuery =
        expandedQuery.toLowerCase().includes('hồ chí minh') ||
        expandedQuery.toLowerCase().includes('hcm') ||
        expandedQuery.toLowerCase().includes('sài gòn')
          ? expandedQuery
          : `${expandedQuery}, Hồ Chí Minh`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `format=json` +
          `&q=${encodeURIComponent(enhancedQuery)}` +
          `&countrycodes=vn` +
          `&accept-language=vi` +
          `&limit=10` + // Tăng limit để có nhiều kết quả hơn
          `&addressdetails=1` + // Lấy chi tiết địa chỉ
          `&dedupe=1` // Loại bỏ trùng lặp
      );
      const data = await response.json();

      // Sắp xếp kết quả: ưu tiên địa chỉ trong TP.HCM
      const sortedData = data.sort((a, b) => {
        const aInHCM =
          a.display_name.toLowerCase().includes('hồ chí minh') ||
          a.display_name.toLowerCase().includes('thủ đức');
        const bInHCM =
          b.display_name.toLowerCase().includes('hồ chí minh') ||
          b.display_name.toLowerCase().includes('thủ đức');

        if (aInHCM && !bInHCM) return -1;
        if (!aInHCM && bInHCM) return 1;
        return b.importance - a.importance; // Sắp xếp theo độ quan trọng
      });

      const results = sortedData.slice(0, 5).map((item) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching address:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && searchQuery.trim().length >= 3) {
        searchAddress(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectSearchResult = (result) => {
    if (result) {
      setPosition({
        latitude: result.lat,
        longitude: result.lon,
      });
      setAddress(result.display_name);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setPosition(newPosition);
        fetchAddress(newPosition.latitude, newPosition.longitude);
        setLoading(false);
      },
      (err) => {
        setError('Không thể lấy vị trí: ' + err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const handleConfirm = () => {
    onSelect(position);
    onClose();
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${position.latitude},${position.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chọn vị trí điểm danh</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tìm kiếm địa chỉ, nhập tọa độ trực tiếp hoặc lấy vị trí hiện tại
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Address Search */}
          <Autocomplete
            options={searchResults}
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : option.display_name
            }
            loading={searchLoading}
            value={null}
            onInputChange={(_, newValue) => {
              console.log('Input changed to:', newValue);
              setSearchQuery(newValue);
            }}
            onChange={(_, newValue) => {
              console.log('Selection changed to:', newValue);
              if (newValue && typeof newValue !== 'string') {
                handleSelectSearchResult(newValue);
              }
            }}
            filterOptions={(x) => x}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tìm kiếm địa chỉ"
                placeholder="VD: Đại học Công nghệ Thông tin, ĐHQG"
                helperText={`Đã tìm thấy ${searchResults.length} kết quả`}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <ListItem {...props} key={option.display_name}>
                <PlaceIcon sx={{ mr: 1, color: 'primary.main' }} />
                <ListItemText
                  primary={option.display_name.split(',').slice(0, 2).join(',')}
                  secondary={option.display_name.split(',').slice(2).join(',')}
                />
              </ListItem>
            )}
            noOptionsText={
              searchQuery.trim().length < 3
                ? 'Nhập ít nhất 3 ký tự để tìm kiếm'
                : 'Không tìm thấy địa chỉ'
            }
            sx={{ mb: 3 }}
          />

          <Button
            variant="outlined"
            startIcon={
              loading ? <CircularProgress size={20} /> : <MyLocationIcon />
            }
            onClick={handleGetCurrentLocation}
            disabled={loading}
            fullWidth
            sx={{ mb: 3 }}
          >
            {loading ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại của tôi'}
          </Button>

          <Divider sx={{ mb: 3 }}>HOẶC NHẬP TỌA ĐỘ</Divider>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Vĩ độ (Latitude)"
              type="number"
              value={position.latitude}
              onChange={(e) => {
                const newLat = parseFloat(e.target.value) || 0;
                setPosition({
                  ...position,
                  latitude: newLat,
                });
              }}
              onBlur={() => fetchAddress(position.latitude, position.longitude)}
              placeholder="Ví dụ: 10.762622"
              inputProps={{ step: 'any' }}
            />
            <TextField
              fullWidth
              label="Kinh độ (Longitude)"
              type="number"
              value={position.longitude}
              onChange={(e) => {
                const newLng = parseFloat(e.target.value) || 0;
                setPosition({
                  ...position,
                  longitude: newLng,
                });
              }}
              onBlur={() => fetchAddress(position.latitude, position.longitude)}
              placeholder="Ví dụ: 106.660172"
              inputProps={{ step: 'any' }}
            />
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}
            >
              <PlaceIcon
                sx={{ color: 'primary.main', fontSize: 20, mt: 0.3 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Vị trí đã chọn:
                </Typography>
                {loadingAddress ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tìm địa chỉ...
                    </Typography>
                  </Box>
                ) : address ? (
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {address}
                  </Typography>
                ) : null}
                <Chip
                  label={`${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ⭕ Bán kính cho phép:
              </Typography>
              <Chip
                label={`${radius} mét`}
                size="small"
                color="primary"
                variant="filled"
              />
            </Box>
          </Paper>

          <Button
            variant="text"
            startIcon={<MapIcon />}
            onClick={openInGoogleMaps}
            fullWidth
            size="small"
          >
            Xem trên Google Maps
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationPicker;
