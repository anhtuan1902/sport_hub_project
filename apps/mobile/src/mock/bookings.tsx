// Booking Mock Data
import React from 'react';

export interface BookingCard {
  id: string;
  courtName: string;
  time: string;
  date: string;
  status: 'Đã xác nhận' | 'Chờ duyệt';
  sportIcon: React.ReactNode;
}

export const BOOKINGS: BookingCard[] = [
  {
    id: 'b1',
    courtName: 'Sân Phú Thọ A3',
    time: '18:00 - 20:00',
    date: 'Thứ 6, 09/05',
    status: 'Đã xác nhận',
    sportIcon: <React.Fragment>🏸</React.Fragment>
  },
  {
    id: 'b2',
    courtName: 'Sân Bóng Đá Mini Q7',
    time: '07:00 - 08:30',
    date: 'Thứ 7, 10/05',
    status: 'Chờ duyệt',
    sportIcon: <React.Fragment>⚽</React.Fragment>
  }
];
