// Sports Types (mở rộng từ court.types.ts)

import { Sport } from './court.types';

export interface SportWithCount extends Sport {
  courtCount: number;
}

// Sport Query DTO
export interface SportQueryDto {
  search?: string;
  active?: boolean;
}
