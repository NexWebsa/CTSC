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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      booking_ratings: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          baby_seats: number | null
          booking_type: string | null
          created_at: string | null
          distance_km: number | null
          driver_id: string | null
          dropoff_location: string | null
          duration_minutes: number | null
          extra_stop: boolean
          extra_stop_location: string | null
          extras: Json
          extras_total: number
          flight_number: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          hours: number | null
          id: string
          is_favourite: boolean | null
          is_guest: boolean
          luggage_carry: number | null
          luggage_checkin: number | null
          notes: string | null
          oversize_luggage: boolean | null
          passengers: number | null
          payment_confirmation_email_ids: Json | null
          payment_confirmation_sent_at: string | null
          payment_status: string | null
          pickup_date: string
          pickup_location: string
          pickup_time: string
          price_estimate: number | null
          return_pickup_date: string | null
          return_pickup_time: string | null
          service_type: string
          status: string | null
          trailer: boolean | null
          trip_direction: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
          yoco_checkout_id: string | null
        }
        Insert: {
          baby_seats?: number | null
          booking_type?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_location?: string | null
          duration_minutes?: number | null
          extra_stop?: boolean
          extra_stop_location?: string | null
          extras?: Json
          extras_total?: number
          flight_number?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          hours?: number | null
          id?: string
          is_favourite?: boolean | null
          is_guest?: boolean
          luggage_carry?: number | null
          luggage_checkin?: number | null
          notes?: string | null
          oversize_luggage?: boolean | null
          passengers?: number | null
          payment_confirmation_email_ids?: Json | null
          payment_confirmation_sent_at?: string | null
          payment_status?: string | null
          pickup_date: string
          pickup_location: string
          pickup_time: string
          price_estimate?: number | null
          return_pickup_date?: string | null
          return_pickup_time?: string | null
          service_type: string
          status?: string | null
          trailer?: boolean | null
          trip_direction?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          yoco_checkout_id?: string | null
        }
        Update: {
          baby_seats?: number | null
          booking_type?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_location?: string | null
          duration_minutes?: number | null
          extra_stop?: boolean
          extra_stop_location?: string | null
          extras?: Json
          extras_total?: number
          flight_number?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          hours?: number | null
          id?: string
          is_favourite?: boolean | null
          is_guest?: boolean
          luggage_carry?: number | null
          luggage_checkin?: number | null
          notes?: string | null
          oversize_luggage?: boolean | null
          passengers?: number | null
          payment_confirmation_email_ids?: Json | null
          payment_confirmation_sent_at?: string | null
          payment_status?: string | null
          pickup_date?: string
          pickup_location?: string
          pickup_time?: string
          price_estimate?: number | null
          return_pickup_date?: string | null
          return_pickup_time?: string | null
          service_type?: string
          status?: string | null
          trailer?: boolean | null
          trip_direction?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          yoco_checkout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_logs: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          latency_ms: number | null
          match_count: number | null
          query: string | null
          reply: string | null
          top_similarity: number | null
          used_fallback: boolean | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          latency_ms?: number | null
          match_count?: number | null
          query?: string | null
          reply?: string | null
          top_similarity?: number | null
          used_fallback?: boolean | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          latency_ms?: number | null
          match_count?: number | null
          query?: string | null
          reply?: string | null
          top_similarity?: number | null
          used_fallback?: boolean | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          license_number: string | null
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      kb_documents: {
        Row: {
          category: string | null
          content: string
          content_hash: string | null
          created_at: string | null
          embedding: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          content_hash?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          content_hash?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      points_of_interest: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          vehicle_prices: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          vehicle_prices?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          vehicle_prices?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trip_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          service_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          service_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          service_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity: number
          created_at: string | null
          description: string | null
          features: string[]
          gallery_images: string[]
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price_per_hour: number | null
          price_per_km: number | null
          slug: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          description?: string | null
          features?: string[]
          gallery_images?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price_per_hour?: number | null
          price_per_km?: number | null
          slug?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          description?: string | null
          features?: string[]
          gallery_images?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price_per_hour?: number | null
          price_per_km?: number | null
          slug?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_view_driver: { Args: { _driver_id: string }; Returns: boolean }
      get_current_driver_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_kb_documents: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          category: string
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "driver"
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
    Enums: {
      app_role: ["admin", "user", "driver"],
    },
  },
} as const
