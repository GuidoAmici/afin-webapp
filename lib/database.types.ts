export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          id: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      order_events: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          created_at: string
          event_type: string
          from_status: string | null
          id: string
          metadata: Json | null
          order_id: string
          to_status: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_type: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          to_status?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_type?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          confirmed_at: string | null
          created_at: string
          delivered_at: string | null
          discount_pct: number | null
          dispatched_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          prepared_at: string | null
          ready_at: string | null
          status: string
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          discount_pct?: number | null
          dispatched_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          prepared_at?: string | null
          ready_at?: string | null
          status?: string
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          discount_pct?: number | null
          dispatched_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          prepared_at?: string | null
          ready_at?: string | null
          status?: string
          total?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string
          payment_date: string | null
          payment_method: string | null
          provider_payment_id: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          payment_date?: string | null
          payment_method?: string | null
          provider_payment_id?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_date?: string | null
          payment_method?: string | null
          provider_payment_id?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          badge: string
          category_id: string
          description: string | null
          id: string
          image: string
          images: string[] | null
          name: string
          price_retail: number | null
          price_wholesale: number | null
          sort_order: number
          subcategory_id: string
        }
        Insert: {
          active?: boolean
          badge?: string
          category_id: string
          description?: string | null
          id: string
          image: string
          images?: string[] | null
          name: string
          price_retail?: number | null
          price_wholesale?: number | null
          sort_order?: number
          subcategory_id: string
        }
        Update: {
          active?: boolean
          badge?: string
          category_id?: string
          description?: string | null
          id?: string
          image?: string
          images?: string[] | null
          name?: string
          price_retail?: number | null
          price_wholesale?: number | null
          sort_order?: number
          subcategory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          codigo_postal: string | null
          created_at: string
          credito_habilitado: boolean
          cuit: string | null
          direccion: string | null
          dni: string | null
          empresa: string | null
          id: string
          localidad: string | null
          nombre: string
          telefono: string | null
          tipo_facturacion: string
          updated_at: string
        }
        Insert: {
          codigo_postal?: string | null
          created_at?: string
          credito_habilitado?: boolean
          cuit?: string | null
          direccion?: string | null
          dni?: string | null
          empresa?: string | null
          id: string
          localidad?: string | null
          nombre: string
          telefono?: string | null
          tipo_facturacion?: string
          updated_at?: string
        }
        Update: {
          codigo_postal?: string | null
          created_at?: string
          credito_habilitado?: boolean
          cuit?: string | null
          direccion?: string | null
          dni?: string | null
          empresa?: string | null
          id?: string
          localidad?: string | null
          nombre?: string
          telefono?: string | null
          tipo_facturacion?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          category_id: string
          id: string
          label: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _transition_order_core: {
        Args: {
          p_actor_id: string
          p_actor_level: number
          p_actor_role: string
          p_axis: string
          p_can_override: boolean
          p_metadata: Json
          p_order_id: string
          p_to: string
        }
        Returns: {
          confirmed_at: string | null
          created_at: string
          delivered_at: string | null
          discount_pct: number | null
          dispatched_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          prepared_at: string | null
          ready_at: string | null
          status: string
          total: number | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      jwt_role: { Args: never; Returns: string }
      transition_order: {
        Args: {
          p_axis: string
          p_metadata?: Json
          p_order_id: string
          p_to: string
        }
        Returns: {
          confirmed_at: string | null
          created_at: string
          delivered_at: string | null
          discount_pct: number | null
          dispatched_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          prepared_at: string | null
          ready_at: string | null
          status: string
          total: number | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      transition_order_system: {
        Args: {
          p_actor_id?: string
          p_actor_role?: string
          p_axis: string
          p_metadata?: Json
          p_order_id: string
          p_to: string
        }
        Returns: {
          confirmed_at: string | null
          created_at: string
          delivered_at: string | null
          discount_pct: number | null
          dispatched_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          prepared_at: string | null
          ready_at: string | null
          status: string
          total: number | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

