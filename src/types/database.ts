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
        Relationships: [
          {
            columns: ['list_id', 'user_id'];
            foreignKeyName: 'items_list_owner_fkey';
            isOneToOne: false;
            referencedColumns: ['id', 'user_id'];
            referencedRelation: 'shopping_lists';
          },
        ];
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
        Relationships: [];
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
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
