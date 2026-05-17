// Amenities Configuration

export const AMENITIES = [
  {
    id: 'parking',
    name: 'Bãi đỗ xe',
    icon: 'car',
  },
  {
    id: 'changing_room',
    name: 'Phòng thay đồ',
    icon: 'shirt',
  },
  {
    id: 'shower',
    name: 'Phòng tắm',
    icon: 'shower',
  },
  {
    id: 'wifi',
    name: 'WiFi',
    icon: 'wifi',
  },
  {
    id: 'air_conditioning',
    name: 'Điều hòa',
    icon: 'snowflake',
  },
  {
    id: 'cafe',
    name: 'Cafe',
    icon: 'cafe',
  },
  {
    id: 'toilet',
    name: 'Nhà vệ sinh',
    icon: 'toilet',
  },
  {
    id: 'equipment_rental',
    name: 'Cho thuê thiết bị',
    icon: 'basketball',
  },
  {
    id: 'lighting',
    name: 'Đèn chiếu sáng',
    icon: 'lightbulb',
  },
  {
    id: 'artificial_turf',
    name: 'Cỏ nhân tạo',
    icon: 'leaf',
  },
  {
    id: 'security',
    name: 'An ninh',
    icon: 'shield-checkmark',
  },
  {
    id: 'first_aid',
    name: 'Sơ cứu',
    icon: 'medkit',
  },
];

export const getAmenityIcon = (id: string) => {
  const amenity = AMENITIES.find(a => a.id === id);
  return amenity?.icon || 'help-circle';
};
