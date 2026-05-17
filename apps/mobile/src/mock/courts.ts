// Court Mock Data

export interface Court {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount?: number;
  price: string;
  image: string;
  distance: string;
  tags: string[];
  status?: 'Trống' | 'Hết';
}

export const RECOMMENDED_COURTS: Court[] = [
  {
    id: 'c1',
    name: 'Sân Câu Lông Phú Thọ',
    location: 'Quận 11, TP.HCM',
    rating: 4.8,
    reviewCount: 124,
    price: '60.000đ/giờ',
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1626224580194-860c3d314844?auto=format&fit=crop&q=80&w=400',
    tags: ['Sân gỗ', 'Trong nhà'],
    status: 'Trống'
  },
  {
    id: 'c2',
    name: 'Sân Bóng Đá Mini Quận 7',
    location: 'Quận 7, TP.HCM',
    rating: 4.5,
    reviewCount: 87,
    price: '250.000đ/giờ',
    distance: '1.4 km',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400',
    tags: ['Cỏ nhân tạo', 'Ngoài trời'],
    status: 'Trống'
  },
  {
    id: 'c3',
    name: 'Pickleball Zone Bình Thạnh',
    location: 'Bình Thạnh, TP.HCM',
    rating: 4.9,
    reviewCount: 56,
    price: '80.000đ/giờ',
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4b1ca?auto=format&fit=crop&q=80&w=400',
    tags: ['Sân cứng', 'Trong nhà'],
    status: 'Hết'
  },
];
