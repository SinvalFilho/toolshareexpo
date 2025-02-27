export type Colors = {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  error: string;
  text: string;
  textSecondary: string;
  income: string;
  expense: string;
  divider: string;
};

export const colors = {
  background: '#F0F4F8',
  surface: '#FFFFFF',
  primary: '#42A5F5',
  secondary: '#64B5F6',
  error: '#D32F2F',
  text: '#212121',
  textSecondary: '#757575',
  income: '#43A047', 
  expense: '#E53935',
  divider: '#E0E0E0',
} as const satisfies Colors;