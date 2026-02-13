export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      operaciones: {
        Row: {
          cleaning_tax: number | null
          created_at: string
          credit_eligible: string | null
          currency: string | null
          custom1: string | null
          down_payment: number | null
          duration_months: number | null
          end_date: string | null
          expenses: number | null
          fire_insurance_cost: number | null
          id: number
          iptu: string | null
          is_promotional: boolean | null
          period: number | null
          price: number | null
          property_id: number
          secondary_currency: string | null
          secondary_price: number | null
          start_date: string | null
          status: string
          tenant_id: string | null
          tokko_operation_id: number | null
          updated_at: string
        }
        Insert: {
          cleaning_tax?: number | null
          created_at?: string
          credit_eligible?: string | null
          currency?: string | null
          custom1?: string | null
          down_payment?: number | null
          duration_months?: number | null
          end_date?: string | null
          expenses?: number | null
          fire_insurance_cost?: number | null
          id?: number
          iptu?: string | null
          is_promotional?: boolean | null
          period?: number | null
          price?: number | null
          property_id: number
          secondary_currency?: string | null
          secondary_price?: number | null
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          tokko_operation_id?: number | null
          updated_at?: string
        }
        Update: {
          cleaning_tax?: number | null
          created_at?: string
          credit_eligible?: string | null
          currency?: string | null
          custom1?: string | null
          down_payment?: number | null
          duration_months?: number | null
          end_date?: string | null
          expenses?: number | null
          fire_insurance_cost?: number | null
          id?: number
          iptu?: string | null
          is_promotional?: boolean | null
          period?: number | null
          price?: number | null
          property_id?: number
          secondary_currency?: string | null
          secondary_price?: number | null
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          tokko_operation_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operaciones_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operaciones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          address_complement: string | null
          age: number | null
          apartment_door: string | null
          appartments_per_floor: number | null
          bathroom_amount: number | null
          block_number: string | null
          branch_id: number | null
          building: string | null
          common_area: string | null
          covered_parking_lot: number | null
          created_at: string
          custom_tags: Json | null
          deleted_at: string | null
          depth_measure: string | null
          description: string | null
          development: Json | null
          dining_room: number | null
          disposition: string | null
          extra_attributes: Json | null
          fake_address: string | null
          files: Json | null
          floor: string | null
          floors_amount: number | null
          front_measure: string | null
          geo_lat: string | null
          geo_long: string | null
          gm_location_type: string | null
          guests_amount: number | null
          id: number
          internal_data: Json | null
          is_denounced: boolean | null
          is_starred_on_web: boolean | null
          legally_checked: string | null
          livable_area: string | null
          living_amount: number | null
          location_id: number | null
          location_level: string | null
          lot_number: string | null
          occupation: Json | null
          orientation: string | null
          parent_division_location_id: number | null
          parking_lot_amount: number | null
          parking_lot_condition: string | null
          parking_lot_type: string | null
          portal_footer: string | null
          private_area: string | null
          producer_id: number | null
          property_condition: string | null
          public_url: string | null
          publication_title: string | null
          quality_level: string | null
          real_address: string | null
          reference_code: string | null
          rich_description: string | null
          roofed_surface: string | null
          room_amount: number | null
          semiroofed_surface: string | null
          seo_description: string | null
          seo_keywords: string | null
          situation: string | null
          status: number
          suite_amount: number | null
          suites_with_closets: number | null
          surface: string | null
          surface_measurement: string | null
          toilet_amount: number | null
          tokko: boolean
          tokko_id: number | null
          total_suites: number | null
          total_surface: string | null
          tv_rooms: number | null
          type_id: number | null
          uncovered_parking_lot: number | null
          unroofed_surface: string | null
          updated_at: string
          user_id: string
          videos: Json | null
          web_price: boolean | null
          zonification: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          age?: number | null
          apartment_door?: string | null
          appartments_per_floor?: number | null
          bathroom_amount?: number | null
          block_number?: string | null
          branch_id?: number | null
          building?: string | null
          common_area?: string | null
          covered_parking_lot?: number | null
          created_at: string
          custom_tags?: Json | null
          deleted_at?: string | null
          depth_measure?: string | null
          description?: string | null
          development?: Json | null
          dining_room?: number | null
          disposition?: string | null
          extra_attributes?: Json | null
          fake_address?: string | null
          files?: Json | null
          floor?: string | null
          floors_amount?: number | null
          front_measure?: string | null
          geo_lat?: string | null
          geo_long?: string | null
          gm_location_type?: string | null
          guests_amount?: number | null
          id?: number
          internal_data?: Json | null
          is_denounced?: boolean | null
          is_starred_on_web?: boolean | null
          legally_checked?: string | null
          livable_area?: string | null
          living_amount?: number | null
          location_id?: number | null
          location_level?: string | null
          lot_number?: string | null
          occupation?: Json | null
          orientation?: string | null
          parent_division_location_id?: number | null
          parking_lot_amount?: number | null
          parking_lot_condition?: string | null
          parking_lot_type?: string | null
          portal_footer?: string | null
          private_area?: string | null
          producer_id?: number | null
          property_condition?: string | null
          public_url?: string | null
          publication_title?: string | null
          quality_level?: string | null
          real_address?: string | null
          reference_code?: string | null
          rich_description?: string | null
          roofed_surface?: string | null
          room_amount?: number | null
          semiroofed_surface?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          situation?: string | null
          status: number
          suite_amount?: number | null
          suites_with_closets?: number | null
          surface?: string | null
          surface_measurement?: string | null
          toilet_amount?: number | null
          tokko?: boolean
          tokko_id?: number | null
          total_suites?: number | null
          total_surface?: string | null
          tv_rooms?: number | null
          type_id?: number | null
          uncovered_parking_lot?: number | null
          unroofed_surface?: string | null
          updated_at?: string
          user_id: string
          videos?: Json | null
          web_price?: boolean | null
          zonification?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          age?: number | null
          apartment_door?: string | null
          appartments_per_floor?: number | null
          bathroom_amount?: number | null
          block_number?: string | null
          branch_id?: number | null
          building?: string | null
          common_area?: string | null
          covered_parking_lot?: number | null
          created_at?: string
          custom_tags?: Json | null
          deleted_at?: string | null
          depth_measure?: string | null
          description?: string | null
          development?: Json | null
          dining_room?: number | null
          disposition?: string | null
          extra_attributes?: Json | null
          fake_address?: string | null
          files?: Json | null
          floor?: string | null
          floors_amount?: number | null
          front_measure?: string | null
          geo_lat?: string | null
          geo_long?: string | null
          gm_location_type?: string | null
          guests_amount?: number | null
          id?: number
          internal_data?: Json | null
          is_denounced?: boolean | null
          is_starred_on_web?: boolean | null
          legally_checked?: string | null
          livable_area?: string | null
          living_amount?: number | null
          location_id?: number | null
          location_level?: string | null
          lot_number?: string | null
          occupation?: Json | null
          orientation?: string | null
          parent_division_location_id?: number | null
          parking_lot_amount?: number | null
          parking_lot_condition?: string | null
          parking_lot_type?: string | null
          portal_footer?: string | null
          private_area?: string | null
          producer_id?: number | null
          property_condition?: string | null
          public_url?: string | null
          publication_title?: string | null
          quality_level?: string | null
          real_address?: string | null
          reference_code?: string | null
          rich_description?: string | null
          roofed_surface?: string | null
          room_amount?: number | null
          semiroofed_surface?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          situation?: string | null
          status?: number
          suite_amount?: number | null
          suites_with_closets?: number | null
          surface?: string | null
          surface_measurement?: string | null
          toilet_amount?: number | null
          tokko?: boolean
          tokko_id?: number | null
          total_suites?: number | null
          total_surface?: string | null
          tv_rooms?: number | null
          type_id?: number | null
          uncovered_parking_lot?: number | null
          unroofed_surface?: string | null
          updated_at?: string
          user_id?: string
          videos?: Json | null
          web_price?: boolean | null
          zonification?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "tokko_branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "tokko_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_parent_division_location_id_fkey"
            columns: ["parent_division_location_id"]
            isOneToOne: false
            referencedRelation: "tokko_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "tokko_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "tokko_property_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties_read: {
        Row: {
          address: string | null
          all_tag_ids: number[] | null
          bathroom_amount: number | null
          country_name: string | null
          cover_photo_thumb: string | null
          cover_photo_url: string | null
          currency: string | null
          description: string | null
          expenses: number | null
          geo_lat: number | null
          geo_long: number | null
          listing_updated_at: string | null
          location_id: number | null
          location_name: string | null
          operacion_id: number | null
          operacion_status: string | null
          parking_lot_amount: number | null
          price: number | null
          property_created_at: string | null
          property_id: number
          property_status: number | null
          property_type_id: number | null
          property_type_name: string | null
          property_updated_at: string | null
          room_amount: number | null
          secondary_currency: string | null
          secondary_price: number | null
          state_name: string | null
          tag_names_type_1: string[] | null
          tag_names_type_2: string[] | null
          tag_names_type_3: string[] | null
          title: string | null
          total_surface: number | null
          user_id: string
          valor_total_primary: number | null
          valor_total_secondary: number | null
        }
        Insert: {
          address?: string | null
          all_tag_ids?: number[] | null
          bathroom_amount?: number | null
          country_name?: string | null
          cover_photo_thumb?: string | null
          cover_photo_url?: string | null
          currency?: string | null
          description?: string | null
          expenses?: number | null
          geo_lat?: number | null
          geo_long?: number | null
          listing_updated_at?: string | null
          location_id?: number | null
          location_name?: string | null
          operacion_id?: number | null
          operacion_status?: string | null
          parking_lot_amount?: number | null
          price?: number | null
          property_created_at?: string | null
          property_id: number
          property_status?: number | null
          property_type_id?: number | null
          property_type_name?: string | null
          property_updated_at?: string | null
          room_amount?: number | null
          secondary_currency?: string | null
          secondary_price?: number | null
          state_name?: string | null
          tag_names_type_1?: string[] | null
          tag_names_type_2?: string[] | null
          tag_names_type_3?: string[] | null
          title?: string | null
          total_surface?: number | null
          user_id: string
          valor_total_primary?: number | null
          valor_total_secondary?: number | null
        }
        Update: {
          address?: string | null
          all_tag_ids?: number[] | null
          bathroom_amount?: number | null
          country_name?: string | null
          cover_photo_thumb?: string | null
          cover_photo_url?: string | null
          currency?: string | null
          description?: string | null
          expenses?: number | null
          geo_lat?: number | null
          geo_long?: number | null
          listing_updated_at?: string | null
          location_id?: number | null
          location_name?: string | null
          operacion_id?: number | null
          operacion_status?: string | null
          parking_lot_amount?: number | null
          price?: number | null
          property_created_at?: string | null
          property_id?: number
          property_status?: number | null
          property_type_id?: number | null
          property_type_name?: string | null
          property_updated_at?: string | null
          room_amount?: number | null
          secondary_currency?: string | null
          secondary_price?: number | null
          state_name?: string | null
          tag_names_type_1?: string[] | null
          tag_names_type_2?: string[] | null
          tag_names_type_3?: string[] | null
          title?: string | null
          total_surface?: number | null
          user_id?: string
          valor_total_primary?: number | null
          valor_total_secondary?: number | null
        }
        Relationships: []
      }
      // ... other tables omitted for brevity
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      rebuild_all_property_listings: { Args: never; Returns: number }
      rebuild_property_listing: {
        Args: { p_property_id: number }
        Returns: undefined
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
