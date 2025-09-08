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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      destinations: {
        Row: {
          country: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          state_province: string | null
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          state_province?: string | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          state_province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string | null
          amenities: Json | null
          category: Database["public"]["Enums"]["hotel_category"]
          created_at: string
          description: string | null
          destination_id: string
          id: string
          images: Json | null
          latitude: number | null
          longitude: number | null
          name: string
          price_per_night: number
          rating: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          category: Database["public"]["Enums"]["hotel_category"]
          created_at?: string
          description?: string | null
          destination_id: string
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          name: string
          price_per_night: number
          rating?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          category?: Database["public"]["Enums"]["hotel_category"]
          created_at?: string
          description?: string | null
          destination_id?: string
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_per_night?: number
          rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotels_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      local_transport: {
        Row: {
          base_fare: number | null
          created_at: string
          description: string | null
          destination_id: string
          features: Json | null
          id: string
          name: string
          per_km_rate: number | null
          type: Database["public"]["Enums"]["local_transport_type"]
        }
        Insert: {
          base_fare?: number | null
          created_at?: string
          description?: string | null
          destination_id: string
          features?: Json | null
          id?: string
          name: string
          per_km_rate?: number | null
          type: Database["public"]["Enums"]["local_transport_type"]
        }
        Update: {
          base_fare?: number | null
          created_at?: string
          description?: string | null
          destination_id?: string
          features?: Json | null
          id?: string
          name?: string
          per_km_rate?: number | null
          type?: Database["public"]["Enums"]["local_transport_type"]
        }
        Relationships: [
          {
            foreignKeyName: "local_transport_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      tourist_spots: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          destination_id: string
          entry_fee: number | null
          id: string
          images: Json | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          rating: number | null
          updated_at: string
          visit_duration_minutes: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id: string
          entry_fee?: number | null
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          rating?: number | null
          updated_at?: string
          visit_duration_minutes?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string
          entry_fee?: number | null
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          rating?: number | null
          updated_at?: string
          visit_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tourist_spots_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_options: {
        Row: {
          arrival_time: string | null
          created_at: string
          departure_time: string | null
          duration_minutes: number | null
          features: Json | null
          from_destination_id: string | null
          id: string
          price: number
          provider: string
          to_destination_id: string | null
          type: Database["public"]["Enums"]["transport_type"]
          updated_at: string
        }
        Insert: {
          arrival_time?: string | null
          created_at?: string
          departure_time?: string | null
          duration_minutes?: number | null
          features?: Json | null
          from_destination_id?: string | null
          id?: string
          price: number
          provider: string
          to_destination_id?: string | null
          type: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
        }
        Update: {
          arrival_time?: string | null
          created_at?: string
          departure_time?: string | null
          duration_minutes?: number | null
          features?: Json | null
          from_destination_id?: string | null
          id?: string
          price?: number
          provider?: string
          to_destination_id?: string | null
          type?: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_options_from_destination_id_fkey"
            columns: ["from_destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_options_to_destination_id_fkey"
            columns: ["to_destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_packages: {
        Row: {
          created_at: string
          description: string | null
          destination_id: string
          id: string
          included_hotels: Json | null
          included_transport: Json | null
          itinerary: Json
          name: string
          status: string | null
          total_days: number
          total_price: number | null
          traveler_group_type: Database["public"]["Enums"]["traveler_group_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          destination_id: string
          id?: string
          included_hotels?: Json | null
          included_transport?: Json | null
          itinerary?: Json
          name: string
          status?: string | null
          total_days: number
          total_price?: number | null
          traveler_group_type: Database["public"]["Enums"]["traveler_group_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          destination_id?: string
          id?: string
          included_hotels?: Json | null
          included_transport?: Json | null
          itinerary?: Json
          name?: string
          status?: string | null
          total_days?: number
          total_price?: number | null
          traveler_group_type?: Database["public"]["Enums"]["traveler_group_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_packages_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_groups: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          preferences: Json | null
          type: Database["public"]["Enums"]["traveler_group_type"]
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          preferences?: Json | null
          type: Database["public"]["Enums"]["traveler_group_type"]
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          preferences?: Json | null
          type?: Database["public"]["Enums"]["traveler_group_type"]
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          accessibility_needs: Json | null
          budget_range: Json | null
          created_at: string
          dietary_restrictions: Json | null
          id: string
          interests: Json | null
          preferred_group_type:
            | Database["public"]["Enums"]["traveler_group_type"]
            | null
          preferred_hotel_category:
            | Database["public"]["Enums"]["hotel_category"]
            | null
          transport_preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_needs?: Json | null
          budget_range?: Json | null
          created_at?: string
          dietary_restrictions?: Json | null
          id?: string
          interests?: Json | null
          preferred_group_type?:
            | Database["public"]["Enums"]["traveler_group_type"]
            | null
          preferred_hotel_category?:
            | Database["public"]["Enums"]["hotel_category"]
            | null
          transport_preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_needs?: Json | null
          budget_range?: Json | null
          created_at?: string
          dietary_restrictions?: Json | null
          id?: string
          interests?: Json | null
          preferred_group_type?:
            | Database["public"]["Enums"]["traveler_group_type"]
            | null
          preferred_hotel_category?:
            | Database["public"]["Enums"]["hotel_category"]
            | null
          transport_preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      hotel_category: "budget" | "mid_range" | "luxury" | "special"
      local_transport_type: "cab" | "bike" | "metro" | "tuk_tuk" | "bus"
      transport_type: "flight" | "railway" | "bus" | "metro"
      traveler_group_type: "solo" | "student" | "couple" | "family" | "group"
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
      hotel_category: ["budget", "mid_range", "luxury", "special"],
      local_transport_type: ["cab", "bike", "metro", "tuk_tuk", "bus"],
      transport_type: ["flight", "railway", "bus", "metro"],
      traveler_group_type: ["solo", "student", "couple", "family", "group"],
    },
  },
} as const
