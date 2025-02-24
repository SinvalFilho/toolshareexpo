export type RegisterForm = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  
  export type ToolCreateForm = {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
  };
  
  export type ReservationCreateForm = {
    tool_id: number;
    start_date: string;
    end_date: string;
    total_price: number;
  };
  
  export type ChatMessageForm = {
    reservation_id: number;
    message: string;
  };