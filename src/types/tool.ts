export type Tool = {
  id: number;
  user_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  status: 'disponível' | 'locada';
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  image?: string;
};

export type ToolData = {
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'disponível' | 'locada';
  user_id: number;
  image?: string | null;
};

export type ToolCreateForm = {
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'disponível' | 'locada';
  image?: any;
  user_id: number; 
};