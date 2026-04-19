export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export type FuelType =
  | "gasolina"
  | "etanol"
  | "flex"
  | "diesel"
  | "gnv"
  | "eletrico"
  | "hibrido";

export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string | null;
  color: string | null;
  fuel_type: FuelType | null;
  current_mileage: number;
  image_url: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}
