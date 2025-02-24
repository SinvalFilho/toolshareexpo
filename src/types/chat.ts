export type ChatMessage = {
    id: number;
    reservation_id: number;
    user_id: number;
    message: string;
    created_at: string;
  };
  
  export type ChatMessageForm = {
    reservation_id: number;
    message: string;
  };