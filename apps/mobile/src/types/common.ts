// Mobile-specific common types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  fullAddress: string;
  province?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
}

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: string;
  description?: string;
}

export interface DatePickerValue {
  date: Date;
  formatted: string;
}

export interface TimePickerValue {
  hour: number;
  minute: number;
  formatted: string;
}
