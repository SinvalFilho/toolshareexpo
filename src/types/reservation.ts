export type Reservation = {
    id: number;
    user_id: number;
    tool_id: number;
    start_date: string;
    end_date: string;
    total_price: number;
    status: 'pendente' | 'confirmada';
    created_at: string;
    updated_at: string;
  };
  
  export type ReservationCreateForm = {
    tool_id: number;
    start_date: string;
    end_date: string;
    total_price: number;
  };