export type User = {
    id: number;
    cpf: string;
    phone: string;
    name: string;
    email: string;
    password: string;
    type: 'locador' | 'locatário';
    token?: string;
    latitude: string;
    longitude: string;
    address: string;
    created_at: string;
    updated_at: string;
  };
  
  export type LoginResponse = {
    token: string;
    user: User;
  };
  
  export type RegisterForm = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  