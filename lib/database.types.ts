export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      acceso_asignaciones: {
        Row: {
          id: string
          otorgado_en: string
          otorgado_por: string | null
          permiso: string
          revocado_en: string | null
          user_id: string
          vence_en: string | null
        }
        Insert: {
          id?: string
          otorgado_en?: string
          otorgado_por?: string | null
          permiso: string
          revocado_en?: string | null
          user_id: string
          vence_en?: string | null
        }
        Update: {
          id?: string
          otorgado_en?: string
          otorgado_por?: string | null
          permiso?: string
          revocado_en?: string | null
          user_id?: string
          vence_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acceso_asignaciones_permiso_fkey"
            columns: ["permiso"]
            isOneToOne: false
            referencedRelation: "acceso_permisos"
            referencedColumns: ["clave"]
          },
        ]
      }
      acceso_permisos: {
        Row: {
          clave: string
          descripcion: string
          estado: string
          sensible: boolean
        }
        Insert: {
          clave: string
          descripcion: string
          estado?: string
          sensible?: boolean
        }
        Update: {
          clave?: string
          descripcion?: string
          estado?: string
          sensible?: boolean
        }
        Relationships: []
      }
      acceso_plantilla_permisos: {
        Row: {
          permiso: string
          plantilla: string
        }
        Insert: {
          permiso: string
          plantilla: string
        }
        Update: {
          permiso?: string
          plantilla?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceso_plantilla_permisos_permiso_fkey"
            columns: ["permiso"]
            isOneToOne: false
            referencedRelation: "acceso_permisos"
            referencedColumns: ["clave"]
          },
          {
            foreignKeyName: "acceso_plantilla_permisos_plantilla_fkey"
            columns: ["plantilla"]
            isOneToOne: false
            referencedRelation: "acceso_plantillas"
            referencedColumns: ["clave"]
          },
        ]
      }
      acceso_plantillas: {
        Row: {
          clave: string
          descripcion: string
        }
        Insert: {
          clave: string
          descripcion: string
        }
        Update: {
          clave?: string
          descripcion?: string
        }
        Relationships: []
      }
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
      cpi_monthly: {
        Row: {
          factor: number
          month: string
          pct: number
        }
        Insert: {
          factor: number
          month: string
          pct: number
        }
        Update: {
          factor?: number
          month?: string
          pct?: number
        }
        Relationships: []
      }
      fiscal_voucher_imports: {
        Row: {
          date_from: string | null
          date_to: string | null
          direction: string
          file_name: string | null
          id: string
          loaded_at: string
          loaded_by: string | null
          queried_at: string | null
          query_number: number | null
          rows_new: number
          rows_updated: number
        }
        Insert: {
          date_from?: string | null
          date_to?: string | null
          direction: string
          file_name?: string | null
          id?: string
          loaded_at?: string
          loaded_by?: string | null
          queried_at?: string | null
          query_number?: number | null
          rows_new?: number
          rows_updated?: number
        }
        Update: {
          date_from?: string | null
          date_to?: string | null
          direction?: string
          file_name?: string | null
          id?: string
          loaded_at?: string
          loaded_by?: string | null
          queried_at?: string | null
          query_number?: number | null
          rows_new?: number
          rows_updated?: number
        }
        Relationships: []
      }
      fiscal_voucher_types: {
        Row: {
          code: number
          letter: string | null
          market: string
          name: string
          sign: number
        }
        Insert: {
          code: number
          letter?: string | null
          market: string
          name: string
          sign: number
        }
        Update: {
          code?: number
          letter?: string | null
          market?: string
          name?: string
          sign?: number
        }
        Relationships: []
      }
      fiscal_vouchers: {
        Row: {
          authorization_code: string | null
          counterparty_doc: string | null
          counterparty_doc_type: number | null
          counterparty_name: string | null
          created_at: string
          currency: string
          direction: string
          exchange_rate: number
          exempt: number
          id: string
          import_id: string | null
          issued_on: string
          issuer_doc: string
          net_0: number
          net_10_5: number
          net_2_5: number
          net_21: number
          net_27: number
          net_5: number
          net_taxed: number
          net_untaxed: number
          number_from: number
          number_to: number | null
          other_taxes: number
          point_of_sale: number
          total: number
          total_ars: number | null
          updated_at: string
          vat_10_5: number
          vat_2_5: number
          vat_21: number
          vat_27: number
          vat_5: number
          vat_total: number
          voucher_type: number
        }
        Insert: {
          authorization_code?: string | null
          counterparty_doc?: string | null
          counterparty_doc_type?: number | null
          counterparty_name?: string | null
          created_at?: string
          currency: string
          direction: string
          exchange_rate?: number
          exempt?: number
          id?: string
          import_id?: string | null
          issued_on: string
          issuer_doc: string
          net_0?: number
          net_10_5?: number
          net_2_5?: number
          net_21?: number
          net_27?: number
          net_5?: number
          net_taxed?: number
          net_untaxed?: number
          number_from: number
          number_to?: number | null
          other_taxes?: number
          point_of_sale: number
          total?: number
          total_ars?: number | null
          updated_at?: string
          vat_10_5?: number
          vat_2_5?: number
          vat_21?: number
          vat_27?: number
          vat_5?: number
          vat_total?: number
          voucher_type: number
        }
        Update: {
          authorization_code?: string | null
          counterparty_doc?: string | null
          counterparty_doc_type?: number | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          direction?: string
          exchange_rate?: number
          exempt?: number
          id?: string
          import_id?: string | null
          issued_on?: string
          issuer_doc?: string
          net_0?: number
          net_10_5?: number
          net_2_5?: number
          net_21?: number
          net_27?: number
          net_5?: number
          net_taxed?: number
          net_untaxed?: number
          number_from?: number
          number_to?: number | null
          other_taxes?: number
          point_of_sale?: number
          total?: number
          total_ars?: number | null
          updated_at?: string
          vat_10_5?: number
          vat_2_5?: number
          vat_21?: number
          vat_27?: number
          vat_5?: number
          vat_total?: number
          voucher_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_vouchers_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "fiscal_voucher_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_vouchers_voucher_type_fkey"
            columns: ["voucher_type"]
            isOneToOne: false
            referencedRelation: "fiscal_voucher_types"
            referencedColumns: ["code"]
          },
        ]
      }
      import_declarations: {
        Row: {
          cif_usd: number
          created_at: string
          created_by: string | null
          fob_usd: number
          id: string
          note: string | null
          number: string
          registered_on: string
          updated_at: string | null
        }
        Insert: {
          cif_usd: number
          created_at?: string
          created_by?: string | null
          fob_usd: number
          id?: string
          note?: string | null
          number: string
          registered_on: string
          updated_at?: string | null
        }
        Update: {
          cif_usd?: number
          created_at?: string
          created_by?: string | null
          fob_usd?: number
          id?: string
          note?: string | null
          number?: string
          registered_on?: string
          updated_at?: string | null
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
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_stock"
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
          category_id: string
          description: string | null
          id: string
          image: string
          images: string[] | null
          name: string
          price_retail: number | null
          price_wholesale: number | null
          sort_order: number
          stock_fisico: number | null
          stock_status: string
          subcategory_id: string
        }
        Insert: {
          active?: boolean
          category_id: string
          description?: string | null
          id: string
          image: string
          images?: string[] | null
          name: string
          price_retail?: number | null
          price_wholesale?: number | null
          sort_order?: number
          stock_fisico?: number | null
          stock_status?: string
          subcategory_id: string
        }
        Update: {
          active?: boolean
          category_id?: string
          description?: string | null
          id?: string
          image?: string
          images?: string[] | null
          name?: string
          price_retail?: number | null
          price_wholesale?: number | null
          sort_order?: number
          stock_fisico?: number | null
          stock_status?: string
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
      usd_rates: {
        Row: {
          blue_buy: number | null
          blue_sell: number | null
          date: string
          mep_sell: number | null
          oficial_buy: number | null
          oficial_sell: number | null
        }
        Insert: {
          blue_buy?: number | null
          blue_sell?: number | null
          date: string
          mep_sell?: number | null
          oficial_buy?: number | null
          oficial_sell?: number | null
        }
        Update: {
          blue_buy?: number | null
          blue_sell?: number | null
          date?: string
          mep_sell?: number | null
          oficial_buy?: number | null
          oficial_sell?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      fiscal_vouchers_v: {
        Row: {
          authorization_code: string | null
          counterparty_doc: string | null
          counterparty_doc_type: number | null
          counterparty_name: string | null
          created_at: string | null
          currency: string | null
          direction: string | null
          exchange_rate: number | null
          exempt: number | null
          f_real: number | null
          f_usd_blue: number | null
          f_usd_mep: number | null
          f_usd_oficial: number | null
          id: string | null
          import_id: string | null
          issued_on: string | null
          issuer_doc: string | null
          market: string | null
          net_0: number | null
          net_10_5: number | null
          net_2_5: number | null
          net_21: number | null
          net_27: number | null
          net_5: number | null
          net_taxed: number | null
          net_untaxed: number | null
          number_from: number | null
          number_to: number | null
          other_taxes: number | null
          point_of_sale: number | null
          sign: number | null
          signed_total_ars: number | null
          total: number | null
          total_ars: number | null
          updated_at: string | null
          vat_10_5: number | null
          vat_2_5: number | null
          vat_21: number | null
          vat_27: number | null
          vat_5: number | null
          vat_total: number | null
          voucher_type: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_vouchers_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "fiscal_voucher_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_vouchers_voucher_type_fkey"
            columns: ["voucher_type"]
            isOneToOne: false
            referencedRelation: "fiscal_voucher_types"
            referencedColumns: ["code"]
          },
        ]
      }
      form_3064_monthly: {
        Row: {
          has_issued: boolean | null
          has_received: boolean | null
          month: string | null
          purchases_foreign_usd: number | null
          purchases_local_ars: number | null
          sales_foreign_usd: number | null
          sales_local_ars: number | null
        }
        Relationships: []
      }
      products_with_stock: {
        Row: {
          active: boolean | null
          category_id: string | null
          category_label: string | null
          description: string | null
          disponible: number | null
          en_stock: boolean | null
          id: string | null
          image: string | null
          images: string[] | null
          name: string | null
          price_retail: number | null
          price_wholesale: number | null
          sort_order: number | null
          stock_status: string | null
          subcategory_id: string | null
          subcategory_label: string | null
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
      cargar_comprobantes_arca: { Args: { archivo: Json }; Returns: Json }
      committed_stock: { Args: { p_product_id: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      jwt_role: { Args: never; Returns: string }
      mis_permisos: { Args: never; Returns: string[] }
      prepare_checkout: {
        Args: { p_order_id: string; p_payment_method: string }
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
      puedo_entrar_panel: { Args: never; Returns: boolean }
      replace_order_items: {
        Args: { p_items: Json; p_notes?: string; p_order_id: string }
        Returns: undefined
      }
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
  public: {
    Enums: {},
  },
} as const

