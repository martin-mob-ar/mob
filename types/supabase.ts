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
      account_type: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      cron_sync_log: {
        Row: {
          chain_index: number
          companies_processed: number | null
          error_message: string | null
          errors: string[] | null
          finished_at: string | null
          id: number
          photos_added: number | null
          photos_removed: number | null
          properties_deleted: number | null
          properties_updated: number | null
          resume_cursor: Json | null
          started_at: string
          status: string
          users_processed: number | null
        }
        Insert: {
          chain_index?: number
          companies_processed?: number | null
          error_message?: string | null
          errors?: string[] | null
          finished_at?: string | null
          id?: never
          photos_added?: number | null
          photos_removed?: number | null
          properties_deleted?: number | null
          properties_updated?: number | null
          resume_cursor?: Json | null
          started_at?: string
          status?: string
          users_processed?: number | null
        }
        Update: {
          chain_index?: number
          companies_processed?: number | null
          error_message?: string | null
          errors?: string[] | null
          finished_at?: string | null
          id?: never
          photos_added?: number | null
          photos_removed?: number | null
          properties_deleted?: number | null
          properties_updated?: number | null
          resume_cursor?: Json | null
          started_at?: string
          status?: string
          users_processed?: number | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          currency_pair: string
          rate: number
          updated_at: string | null
        }
        Insert: {
          currency_pair: string
          rate: number
          updated_at?: string | null
        }
        Update: {
          currency_pair?: string
          rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      favoritos: {
        Row: {
          created_at: string | null
          id: number
          property_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          property_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          property_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          country_code: string | null
          created_at: string | null
          email: string
          email_status: string | null
          id: number
          message: string | null
          name: string
          notion_status: string | null
          owner_id: string
          phone: string | null
          property_id: number
          source: string
          submitter_user_id: string | null
          tokko_status: string | null
          type: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          email: string
          email_status?: string | null
          id?: never
          message?: string | null
          name: string
          notion_status?: string | null
          owner_id: string
          phone?: string | null
          property_id: number
          source?: string
          submitter_user_id?: string | null
          tokko_status?: string | null
          type: string
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          email?: string
          email_status?: string | null
          id?: never
          message?: string | null
          name?: string
          notion_status?: string | null
          owner_id?: string
          phone?: string | null
          property_id?: number
          source?: string
          submitter_user_id?: string | null
          tokko_status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_submitter_user_id_fkey"
            columns: ["submitter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
          ipc_adjustment: string | null
          iptu: string | null
          is_promotional: boolean | null
          min_start_date: string | null
          period: string | null
          planMobElegido: string | null
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
          ipc_adjustment?: string | null
          iptu?: string | null
          is_promotional?: boolean | null
          min_start_date?: string | null
          period?: string | null
          planMobElegido?: string | null
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
          ipc_adjustment?: string | null
          iptu?: string | null
          is_promotional?: boolean | null
          min_start_date?: string | null
          period?: string | null
          planMobElegido?: string | null
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
          available_date: string | null
          bathroom_amount: number | null
          block_number: string | null
          building: string | null
          common_area: string | null
          company_id: number | null
          contact_phone: string | null
          covered_parking_lot: number | null
          created_at: string
          custom_tags: Json | null
          deleted_at: string | null
          depth_measure: string | null
          description: string | null
          development: Json | null
          dining_room: number | null
          disposition: string | null
          draft_step: number | null
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
          key_coordination: string | null
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
          producer_email: string | null
          producer_name: string | null
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
          slug: string | null
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
          updated_at: string | null
          user_id: string
          videos: Json | null
          visit_days: string[] | null
          visit_hours: string[] | null
          web_price: boolean | null
          zonification: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          age?: number | null
          apartment_door?: string | null
          appartments_per_floor?: number | null
          available_date?: string | null
          bathroom_amount?: number | null
          block_number?: string | null
          building?: string | null
          common_area?: string | null
          company_id?: number | null
          contact_phone?: string | null
          covered_parking_lot?: number | null
          created_at: string
          custom_tags?: Json | null
          deleted_at?: string | null
          depth_measure?: string | null
          description?: string | null
          development?: Json | null
          dining_room?: number | null
          disposition?: string | null
          draft_step?: number | null
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
          key_coordination?: string | null
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
          producer_email?: string | null
          producer_name?: string | null
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
          slug?: string | null
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
          updated_at?: string | null
          user_id: string
          videos?: Json | null
          visit_days?: string[] | null
          visit_hours?: string[] | null
          web_price?: boolean | null
          zonification?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          age?: number | null
          apartment_door?: string | null
          appartments_per_floor?: number | null
          available_date?: string | null
          bathroom_amount?: number | null
          block_number?: string | null
          building?: string | null
          common_area?: string | null
          company_id?: number | null
          contact_phone?: string | null
          covered_parking_lot?: number | null
          created_at?: string
          custom_tags?: Json | null
          deleted_at?: string | null
          depth_measure?: string | null
          description?: string | null
          development?: Json | null
          dining_room?: number | null
          disposition?: string | null
          draft_step?: number | null
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
          key_coordination?: string | null
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
          producer_email?: string | null
          producer_name?: string | null
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
          slug?: string | null
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
          updated_at?: string | null
          user_id?: string
          videos?: Json | null
          visit_days?: string[] | null
          visit_hours?: string[] | null
          web_price?: boolean | null
          zonification?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "tokko_company"
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
          age: number | null
          all_tag_ids: number[] | null
          bathroom_amount: number | null
          company_logo: string | null
          company_name: string | null
          contact_phone: string | null
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
          min_start_date: string | null
          mob_plan: string
          operacion_id: number | null
          operacion_status: string | null
          owner_account_type: number | null
          owner_verified: boolean
          parent_location_name: string | null
          parking_lot_amount: number | null
          price: number | null
          property_created_at: string | null
          property_id: number
          property_status: number | null
          property_type_id: number | null
          property_type_name: string | null
          property_updated_at: string | null
          roofed_surface: number | null
          room_amount: number | null
          secondary_currency: string | null
          secondary_price: number | null
          slug: string | null
          sort_priority: number
          state_name: string | null
          suite_amount: number | null
          tag_names_type_1: string[] | null
          tag_names_type_2: string[] | null
          tag_names_type_3: string[] | null
          tokko_id: number | null
          total_surface: number | null
          user_id: string
          valor_total_primary: number | null
          valor_total_secondary: number | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          all_tag_ids?: number[] | null
          bathroom_amount?: number | null
          company_logo?: string | null
          company_name?: string | null
          contact_phone?: string | null
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
          min_start_date?: string | null
          mob_plan?: string
          operacion_id?: number | null
          operacion_status?: string | null
          owner_account_type?: number | null
          owner_verified?: boolean
          parent_location_name?: string | null
          parking_lot_amount?: number | null
          price?: number | null
          property_created_at?: string | null
          property_id: number
          property_status?: number | null
          property_type_id?: number | null
          property_type_name?: string | null
          property_updated_at?: string | null
          roofed_surface?: number | null
          room_amount?: number | null
          secondary_currency?: string | null
          secondary_price?: number | null
          slug?: string | null
          sort_priority?: number
          state_name?: string | null
          suite_amount?: number | null
          tag_names_type_1?: string[] | null
          tag_names_type_2?: string[] | null
          tag_names_type_3?: string[] | null
          tokko_id?: number | null
          total_surface?: number | null
          user_id: string
          valor_total_primary?: number | null
          valor_total_secondary?: number | null
        }
        Update: {
          address?: string | null
          age?: number | null
          all_tag_ids?: number[] | null
          bathroom_amount?: number | null
          company_logo?: string | null
          company_name?: string | null
          contact_phone?: string | null
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
          min_start_date?: string | null
          mob_plan?: string
          operacion_id?: number | null
          operacion_status?: string | null
          owner_account_type?: number | null
          owner_verified?: boolean
          parent_location_name?: string | null
          parking_lot_amount?: number | null
          price?: number | null
          property_created_at?: string | null
          property_id?: number
          property_status?: number | null
          property_type_id?: number | null
          property_type_name?: string | null
          property_updated_at?: string | null
          roofed_surface?: number | null
          room_amount?: number | null
          secondary_currency?: string | null
          secondary_price?: number | null
          slug?: string | null
          sort_priority?: number
          state_name?: string | null
          suite_amount?: number | null
          tag_names_type_1?: string[] | null
          tag_names_type_2?: string[] | null
          tag_names_type_3?: string[] | null
          tokko_id?: number | null
          total_surface?: number | null
          user_id?: string
          valor_total_primary?: number | null
          valor_total_secondary?: number | null
        }
        Relationships: []
      }
      tokko_company: {
        Row: {
          address: string | null
          contact_info: string | null
          created_at: string
          email: string | null
          id: number
          last_incremental_sync_at: string | null
          logo: string | null
          name: string
          phone: string | null
          phone_country_code: string | null
          tokko_key_enc: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_info?: string | null
          created_at?: string
          email?: string | null
          id?: number
          last_incremental_sync_at?: string | null
          logo?: string | null
          name: string
          phone?: string | null
          phone_country_code?: string | null
          tokko_key_enc?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_info?: string | null
          created_at?: string
          email?: string | null
          id?: number
          last_incremental_sync_at?: string | null
          logo?: string | null
          name?: string
          phone?: string | null
          phone_country_code?: string | null
          tokko_key_enc?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokko_company_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tokko_country: {
        Row: {
          id: number
          iso_code: string
          name: string
          resource_uri: string | null
        }
        Insert: {
          id: number
          iso_code: string
          name: string
          resource_uri?: string | null
        }
        Update: {
          id?: number
          iso_code?: string
          name?: string
          resource_uri?: string | null
        }
        Relationships: []
      }
      tokko_location: {
        Row: {
          country_id: number | null
          created_at: string
          depth: number | null
          id: number
          name: string
          name_search: string | null
          parent_location_id: number | null
          resource_uri: string | null
          state_id: number | null
          type_code: string | null
          updated_at: string
          weight: number | null
          zip_code: string | null
        }
        Insert: {
          country_id?: number | null
          created_at?: string
          depth?: number | null
          id: number
          name: string
          name_search?: string | null
          parent_location_id?: number | null
          resource_uri?: string | null
          state_id?: number | null
          type_code?: string | null
          updated_at?: string
          weight?: number | null
          zip_code?: string | null
        }
        Update: {
          country_id?: number | null
          created_at?: string
          depth?: number | null
          id?: number
          name?: string
          name_search?: string | null
          parent_location_id?: number | null
          resource_uri?: string | null
          state_id?: number | null
          type_code?: string | null
          updated_at?: string
          weight?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokko_location_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "tokko_country"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokko_location_parent_location_id_fkey"
            columns: ["parent_location_id"]
            isOneToOne: false
            referencedRelation: "tokko_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokko_location_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "tokko_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokko_location_type_code_fkey"
            columns: ["type_code"]
            isOneToOne: false
            referencedRelation: "tokko_location_type"
            referencedColumns: ["code"]
          },
        ]
      }
      tokko_location_type: {
        Row: {
          code: string
          description: string | null
        }
        Insert: {
          code: string
          description?: string | null
        }
        Update: {
          code?: string
          description?: string | null
        }
        Relationships: []
      }
      tokko_operation_type: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      tokko_property_file: {
        Row: {
          created_at: string
          file_type: string | null
          filename: string | null
          id: number
          order: number
          property_id: number | null
          url: string
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          filename?: string | null
          id?: number
          order?: number
          property_id?: number | null
          url: string
        }
        Update: {
          created_at?: string
          file_type?: string | null
          filename?: string | null
          id?: number
          order?: number
          property_id?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokko_property_file_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tokko_property_photo: {
        Row: {
          created_at: string
          description: string | null
          id: number
          image: string
          is_blueprint: boolean | null
          is_front_cover: boolean | null
          order: number
          original: string
          property_id: number | null
          storage_path: string | null
          thumb: string
          tokko_source_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          image: string
          is_blueprint?: boolean | null
          is_front_cover?: boolean | null
          order?: number
          original: string
          property_id?: number | null
          storage_path?: string | null
          thumb: string
          tokko_source_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          image?: string
          is_blueprint?: boolean | null
          is_front_cover?: boolean | null
          order?: number
          original?: string
          property_id?: number | null
          storage_path?: string | null
          thumb?: string
          tokko_source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokko_property_photo_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tokko_property_property_tag: {
        Row: {
          property_id: number
          tag_id: number
        }
        Insert: {
          property_id: number
          tag_id: number
        }
        Update: {
          property_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tokko_property_property_tag_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokko_property_property_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tokko_property_tag"
            referencedColumns: ["id"]
          },
        ]
      }
      tokko_property_tag: {
        Row: {
          id: number
          name: string
          type: number
        }
        Insert: {
          id: number
          name: string
          type: number
        }
        Update: {
          id?: number
          name?: string
          type?: number
        }
        Relationships: []
      }
      tokko_property_type: {
        Row: {
          code: string
          id: number
          name: string
        }
        Insert: {
          code: string
          id: number
          name: string
        }
        Update: {
          code?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      tokko_property_video: {
        Row: {
          created_at: string
          description: string | null
          id: number
          order: number
          property_id: number | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          order?: number
          property_id?: number | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          order?: number
          property_id?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokko_property_video_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tokko_state: {
        Row: {
          country_id: number
          id: number
          name: string
          name_search: string | null
          resource_uri: string | null
          sap_code: string | null
        }
        Insert: {
          country_id: number
          id: number
          name: string
          name_search?: string | null
          resource_uri?: string | null
          sap_code?: string | null
        }
        Update: {
          country_id?: number
          id?: number
          name?: string
          name_search?: string | null
          resource_uri?: string | null
          sap_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokko_state_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "tokko_country"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_type: number | null
          auth_id: string
          created_at: string
          dni: string | null
          email: string
          hoggax_approved: boolean | null
          hoggax_last_verification_date: string | null
          hoggax_max_rent_plus_expenses: number | null
          id: string
          logo: string | null
          name: string | null
          sync_message: string | null
          sync_progress: Json | null
          sync_properties_count: number | null
          sync_started_at: string | null
          sync_status: string
          telefono: string | null
          telefono_country_code: string | null
          telefono_extension: string | null
          tokko_api_hash: string | null
          tokko_api_key_enc: string | null
          tokko_email: string | null
          tokko_last_sync_at: string | null
          truora_document_verified: boolean | null
          truora_last_verification_date: string | null
          updated_at: string
        }
        Insert: {
          account_type?: number | null
          auth_id: string
          created_at?: string
          dni?: string | null
          email: string
          hoggax_approved?: boolean | null
          hoggax_last_verification_date?: string | null
          hoggax_max_rent_plus_expenses?: number | null
          id?: string
          logo?: string | null
          name?: string | null
          sync_message?: string | null
          sync_progress?: Json | null
          sync_properties_count?: number | null
          sync_started_at?: string | null
          sync_status?: string
          telefono?: string | null
          telefono_country_code?: string | null
          telefono_extension?: string | null
          tokko_api_hash?: string | null
          tokko_api_key_enc?: string | null
          tokko_email?: string | null
          tokko_last_sync_at?: string | null
          truora_document_verified?: boolean | null
          truora_last_verification_date?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: number | null
          auth_id?: string
          created_at?: string
          dni?: string | null
          email?: string
          hoggax_approved?: boolean | null
          hoggax_last_verification_date?: string | null
          hoggax_max_rent_plus_expenses?: number | null
          id?: string
          logo?: string | null
          name?: string | null
          sync_message?: string | null
          sync_progress?: Json | null
          sync_properties_count?: number | null
          sync_started_at?: string | null
          sync_status?: string
          telefono?: string | null
          telefono_country_code?: string | null
          telefono_extension?: string | null
          tokko_api_hash?: string | null
          tokko_api_key_enc?: string | null
          tokko_email?: string | null
          tokko_last_sync_at?: string | null
          truora_document_verified?: boolean | null
          truora_last_verification_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_account_type_fkey"
            columns: ["account_type"]
            isOneToOne: false
            referencedRelation: "account_type"
            referencedColumns: ["id"]
          },
        ]
      }
      verificaciones_hoggax: {
        Row: {
          antiguedad: string | null
          case: number | null
          created_at: string
          dni: string | null
          flow_name: string
          genero: string | null
          hoggax_approved: boolean | null
          hoggax_max_rent_plus_expenses: number | null
          hoggax_raw_response: Json | null
          id: string
          ingresos_mensuales: number | null
          message: string | null
          property_rent_plus_expenses: number | null
          reason_code: string | null
          situacion_laboral: string | null
          user_id: string
        }
        Insert: {
          antiguedad?: string | null
          case?: number | null
          created_at?: string
          dni?: string | null
          flow_name: string
          genero?: string | null
          hoggax_approved?: boolean | null
          hoggax_max_rent_plus_expenses?: number | null
          hoggax_raw_response?: Json | null
          id?: string
          ingresos_mensuales?: number | null
          message?: string | null
          property_rent_plus_expenses?: number | null
          reason_code?: string | null
          situacion_laboral?: string | null
          user_id: string
        }
        Update: {
          antiguedad?: string | null
          case?: number | null
          created_at?: string
          dni?: string | null
          flow_name?: string
          genero?: string | null
          hoggax_approved?: boolean | null
          hoggax_max_rent_plus_expenses?: number | null
          hoggax_raw_response?: Json | null
          id?: string
          ingresos_mensuales?: number | null
          message?: string | null
          property_rent_plus_expenses?: number | null
          reason_code?: string | null
          situacion_laboral?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verificaciones_hoggax_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      verificaciones_truora: {
        Row: {
          created_at: string
          date_of_birth: string | null
          document_number: string | null
          document_type: string | null
          flow_name: string
          gender: string | null
          id: string
          last_name: string | null
          name: string | null
          raw_response: Json | null
          status: string | null
          truora_document_verified: boolean | null
          user_id: string
          validation_id: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          document_number?: string | null
          document_type?: string | null
          flow_name: string
          gender?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          raw_response?: Json | null
          status?: string | null
          truora_document_verified?: boolean | null
          user_id: string
          validation_id?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          document_number?: string | null
          document_type?: string | null
          flow_name?: string
          gender?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          raw_response?: Json | null
          status?: string | null
          truora_document_verified?: boolean | null
          user_id?: string
          validation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verificaciones_truora_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      visita_proposals: {
        Row: {
          created_at: string
          id: number
          message: string | null
          proposed_by: string
          proposed_date: string
          proposed_time: string
          status: string
          visita_id: number
        }
        Insert: {
          created_at?: string
          id?: never
          message?: string | null
          proposed_by: string
          proposed_date: string
          proposed_time: string
          status?: string
          visita_id: number
        }
        Update: {
          created_at?: string
          id?: never
          message?: string | null
          proposed_by?: string
          proposed_date?: string
          proposed_time?: string
          status?: string
          visita_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "visita_proposals_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          confirmed_date: string | null
          confirmed_time: string | null
          created_at: string
          id: number
          operacion_id: number | null
          owner_feedback: string | null
          owner_user_id: string
          owner_wa_context: string | null
          postvisit_sent_at: string | null
          property_id: number
          reminder_24h_sent_at: string | null
          reminder_2h_sent_at: string | null
          requester_country_code: string | null
          requester_email: string
          requester_feedback: string | null
          requester_name: string
          requester_phone: string | null
          requester_user_id: string | null
          requester_wa_context: string | null
          status: string
          updated_at: string
          whatsapp_pending_proposal_id: number | null
          whatsapp_state: string | null
        }
        Insert: {
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string
          id?: never
          operacion_id?: number | null
          owner_feedback?: string | null
          owner_user_id: string
          owner_wa_context?: string | null
          postvisit_sent_at?: string | null
          property_id: number
          reminder_24h_sent_at?: string | null
          reminder_2h_sent_at?: string | null
          requester_country_code?: string | null
          requester_email: string
          requester_feedback?: string | null
          requester_name: string
          requester_phone?: string | null
          requester_user_id?: string | null
          requester_wa_context?: string | null
          status?: string
          updated_at?: string
          whatsapp_pending_proposal_id?: number | null
          whatsapp_state?: string | null
        }
        Update: {
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string
          id?: never
          operacion_id?: number | null
          owner_feedback?: string | null
          owner_user_id?: string
          owner_wa_context?: string | null
          postvisit_sent_at?: string | null
          property_id?: number
          reminder_24h_sent_at?: string | null
          reminder_2h_sent_at?: string | null
          requester_country_code?: string | null
          requester_email?: string
          requester_feedback?: string | null
          requester_name?: string
          requester_phone?: string | null
          requester_user_id?: string | null
          requester_wa_context?: string | null
          status?: string
          updated_at?: string
          whatsapp_pending_proposal_id?: number | null
          whatsapp_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitas_operacion_id_fkey"
            columns: ["operacion_id"]
            isOneToOne: false
            referencedRelation: "operaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_requester_user_id_fkey"
            columns: ["requester_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_whatsapp_pending_proposal_id_fkey"
            columns: ["whatsapp_pending_proposal_id"]
            isOneToOne: false
            referencedRelation: "visita_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_debug_log: {
        Row: {
          created_at: string | null
          error: string | null
          id: number
          matched_branch: string | null
          raw_payload: Json | null
          sender_phone: string | null
          user_id: string | null
          visita_id: number | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: number
          matched_branch?: string | null
          raw_payload?: Json | null
          sender_phone?: string | null
          user_id?: string | null
          visita_id?: number | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: number
          matched_branch?: string | null
          raw_payload?: Json | null
          sender_phone?: string | null
          user_id?: string | null
          visita_id?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_sync_properties: {
        Args: { p_company_id: number; p_properties: Json; p_user_id: string }
        Returns: Json
      }
      bulk_update_photo_urls: { Args: { p_updates: Json }; Returns: undefined }
      check_email_exists: { Args: { email_input: string }; Returns: boolean }
      disable_listing_triggers: { Args: never; Returns: undefined }
      enable_listing_triggers: { Args: never; Returns: undefined }
      generate_property_slug: {
        Args: {
          p_location_depth: number
          p_location_name: string
          p_parent_location_name: string
          p_property_id: number
          p_room_amount: number
          p_type_name: string
        }
        Returns: string
      }
      get_unique_tags_from_listings: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_usd_ars_rate: { Args: never; Returns: number }
      immutable_unaccent: { Args: { "": string }; Returns: string }
      rebuild_all_property_listings: { Args: never; Returns: number }
      rebuild_property_listing: {
        Args: { p_property_id: number }
        Returns: undefined
      }
      rebuild_user_property_listings: {
        Args: { p_user_id: string }
        Returns: number
      }
      reset_user_data: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
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
