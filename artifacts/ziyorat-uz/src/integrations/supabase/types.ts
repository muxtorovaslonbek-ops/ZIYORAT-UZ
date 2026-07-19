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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string | null
          booking_time: string | null
          created_at: string
          id: string
          notes: string | null
          service_id: string
          service_name: string
          service_type: string
          user_id: string
          viloyat: string
        }
        Insert: {
          booking_date?: string | null
          booking_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          service_id: string
          service_name: string
          service_type: string
          user_id: string
          viloyat: string
        }
        Update: {
          booking_date?: string | null
          booking_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          service_id?: string
          service_name?: string
          service_type?: string
          user_id?: string
          viloyat?: string
        }
        Relationships: []
      }
      contract_applications: {
        Row: {
          address: string | null
          applicant_type: Database["public"]["Enums"]["contract_applicant_type"]
          certificate_file_url: string | null
          certificate_number: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          message: string | null
          organization_name: string | null
          phone: string
          region: string | null
          status: Database["public"]["Enums"]["contract_application_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          applicant_type: Database["public"]["Enums"]["contract_applicant_type"]
          certificate_file_url?: string | null
          certificate_number?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          message?: string | null
          organization_name?: string | null
          phone: string
          region?: string | null
          status?: Database["public"]["Enums"]["contract_application_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          applicant_type?: Database["public"]["Enums"]["contract_applicant_type"]
          certificate_file_url?: string | null
          certificate_number?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          organization_name?: string | null
          phone?: string
          region?: string | null
          status?: Database["public"]["Enums"]["contract_application_status"]
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_data: Json
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_data: Json
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_data?: Json
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          admin_note: string | null
          amount_uzs: number
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["pay_method"]
          plan: Database["public"]["Enums"]["sub_plan"]
          receipt_url: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["pay_status"]
          updated_at: string
          user_id: string
          user_note: string | null
        }
        Insert: {
          admin_note?: string | null
          amount_uzs: number
          created_at?: string
          id?: string
          payment_method: Database["public"]["Enums"]["pay_method"]
          plan: Database["public"]["Enums"]["sub_plan"]
          receipt_url: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["pay_status"]
          updated_at?: string
          user_id: string
          user_note?: string | null
        }
        Update: {
          admin_note?: string | null
          amount_uzs?: number
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["pay_method"]
          plan?: Database["public"]["Enums"]["sub_plan"]
          receipt_url?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["pay_status"]
          updated_at?: string
          user_id?: string
          user_note?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          card_holder: string | null
          card_number: string | null
          click_id: string | null
          click_phone: string | null
          id: number
          instructions: string | null
          payme_id: string | null
          payme_phone: string | null
          updated_at: string
        }
        Insert: {
          card_holder?: string | null
          card_number?: string | null
          click_id?: string | null
          click_phone?: string | null
          id?: number
          instructions?: string | null
          payme_id?: string | null
          payme_phone?: string | null
          updated_at?: string
        }
        Update: {
          card_holder?: string | null
          card_number?: string | null
          click_id?: string | null
          click_phone?: string | null
          id?: number
          instructions?: string | null
          payme_id?: string | null
          payme_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          service_id: string
          service_name: string | null
          service_type: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          service_id: string
          service_name?: string | null
          service_type: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          service_id?: string
          service_name?: string | null
          service_type?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          payment_request_id: string | null
          plan: Database["public"]["Enums"]["sub_plan"]
          source: Database["public"]["Enums"]["sub_source"]
          started_at: string
          status: Database["public"]["Enums"]["sub_status"]
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          payment_request_id?: string | null
          plan: Database["public"]["Enums"]["sub_plan"]
          source: Database["public"]["Enums"]["sub_source"]
          started_at?: string
          status?: Database["public"]["Enums"]["sub_status"]
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          payment_request_id?: string | null
          plan?: Database["public"]["Enums"]["sub_plan"]
          source?: Database["public"]["Enums"]["sub_source"]
          started_at?: string
          status?: Database["public"]["Enums"]["sub_status"]
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_active_subscription: {
        Args: { _user_id: string }
        Returns: {
          expires_at: string
          id: string
          plan: Database["public"]["Enums"]["sub_plan"]
          source: Database["public"]["Enums"]["sub_source"]
          started_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      contract_applicant_type: "guide" | "hotel" | "restaurant"
      contract_application_status: "new" | "reviewing" | "approved" | "rejected"
      pay_method: "click" | "payme" | "card" | "other"
      pay_status: "pending" | "approved" | "rejected"
      sub_plan: "1m" | "3m" | "12m"
      sub_source: "stripe" | "manual"
      sub_status: "active" | "expired" | "canceled"
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
      app_role: ["admin", "user"],
      contract_applicant_type: ["guide", "hotel", "restaurant"],
      contract_application_status: ["new", "reviewing", "approved", "rejected"],
      pay_method: ["click", "payme", "card", "other"],
      pay_status: ["pending", "approved", "rejected"],
      sub_plan: ["1m", "3m", "12m"],
      sub_source: ["stripe", "manual"],
      sub_status: ["active", "expired", "canceled"],
    },
  },
} as const
