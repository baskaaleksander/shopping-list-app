export type AppDatabase = {
  public: {
    Tables: {
      items: {
        Insert: {
          completed?: boolean;
          created_at?: string;
          id?: string;
          list_id: string;
          name: string;
          quantity?: number;
          updated_at?: string;
          user_id: string;
        };
        Row: {
          completed: boolean;
          created_at: string;
          id: string;
          list_id: string;
          name: string;
          quantity: number;
          updated_at: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          created_at?: string;
          id?: string;
          list_id?: string;
          name?: string;
          quantity?: number;
          updated_at?: string;
          user_id?: string;
        };
      };
      profiles: {
        Insert: {
          created_at?: string;
          id: string;
          updated_at?: string;
          username: string;
        };
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
          username: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          username?: string;
        };
      };
      shopping_lists: {
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
};
