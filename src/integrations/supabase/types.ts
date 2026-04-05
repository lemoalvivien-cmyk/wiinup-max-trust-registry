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
      ai_prospects: {
        Row: {
          ai_justification: string | null
          ai_score: number | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          entreprise_id: string | null
          id: string
          sent_at: string | null
          signal_type: string | null
          siren: string | null
          source: string | null
          status: string | null
          suggested_message: string | null
          updated_at: string | null
        }
        Insert: {
          ai_justification?: string | null
          ai_score?: number | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          entreprise_id?: string | null
          id?: string
          sent_at?: string | null
          signal_type?: string | null
          siren?: string | null
          source?: string | null
          status?: string | null
          suggested_message?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_justification?: string | null
          ai_score?: number | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          entreprise_id?: string | null
          id?: string
          sent_at?: string | null
          signal_type?: string | null
          siren?: string | null
          source?: string | null
          status?: string | null
          suggested_message?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prospects_entreprise_id_fkey"
            columns: ["entreprise_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          sha256_hash: string
          updated_at: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          sha256_hash: string
          updated_at?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          sha256_hash?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      besoins: {
        Row: {
          ai_confidence_score: number | null
          ai_source: string | null
          budget_range: string | null
          created_at: string | null
          description: string
          entreprise_id: string
          id: string
          is_phantom: boolean | null
          sector_target: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          ai_source?: string | null
          budget_range?: string | null
          created_at?: string | null
          description: string
          entreprise_id: string
          id?: string
          is_phantom?: boolean | null
          sector_target: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          ai_source?: string | null
          budget_range?: string | null
          created_at?: string | null
          description?: string
          entreprise_id?: string
          id?: string
          is_phantom?: boolean | null
          sector_target?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "besoins_entreprise_id_fkey"
            columns: ["entreprise_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          created_at: string | null
          facilitateur_id: string
          id: string
          introduction_id: string
          paid_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          facilitateur_id: string
          id?: string
          introduction_id: string
          paid_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          facilitateur_id?: string
          id?: string
          introduction_id?: string
          paid_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_facilitateur_id_fkey"
            columns: ["facilitateur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: true
            referencedRelation: "introductions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: true
            referencedRelation: "introductions_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_flags: {
        Row: {
          created_at: string | null
          evidence: Json | null
          flag_type: string
          flagged_user_id: string | null
          id: string
          resolved: boolean | null
          resolved_by: string | null
          severity: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          evidence?: Json | null
          flag_type: string
          flagged_user_id?: string | null
          id?: string
          resolved?: boolean | null
          resolved_by?: string | null
          severity: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          evidence?: Json | null
          flag_type?: string
          flagged_user_id?: string | null
          id?: string
          resolved?: boolean | null
          resolved_by?: string | null
          severity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_flags_flagged_user_id_fkey"
            columns: ["flagged_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      introductions: {
        Row: {
          besoin_id: string
          commission_amount: number | null
          created_at: string | null
          deal_amount: number | null
          entreprise_confirmed: boolean | null
          facilitateur_confirmed: boolean | null
          facilitateur_id: string
          id: string
          proof_count: number | null
          prospect_company: string
          prospect_email: string | null
          prospect_name: string
          prospect_phone: string | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          besoin_id: string
          commission_amount?: number | null
          created_at?: string | null
          deal_amount?: number | null
          entreprise_confirmed?: boolean | null
          facilitateur_confirmed?: boolean | null
          facilitateur_id: string
          id?: string
          proof_count?: number | null
          prospect_company: string
          prospect_email?: string | null
          prospect_name: string
          prospect_phone?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          besoin_id?: string
          commission_amount?: number | null
          created_at?: string | null
          deal_amount?: number | null
          entreprise_confirmed?: boolean | null
          facilitateur_confirmed?: boolean | null
          facilitateur_id?: string
          id?: string
          proof_count?: number | null
          prospect_company?: string
          prospect_email?: string | null
          prospect_name?: string
          prospect_phone?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "introductions_besoin_id_fkey"
            columns: ["besoin_id"]
            isOneToOne: false
            referencedRelation: "besoins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introductions_facilitateur_id_fkey"
            columns: ["facilitateur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preuves: {
        Row: {
          created_at: string | null
          file_url: string | null
          id: string
          introduction_id: string
          level: string
          metadata: Json | null
          points: number
          sha256_hash: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          introduction_id: string
          level: string
          metadata?: Json | null
          points: number
          sha256_hash: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          introduction_id?: string
          level?: string
          metadata?: Json | null
          points?: number
          sha256_hash?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preuves_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "introductions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preuves_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "introductions_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          id: string
          is_founder: boolean | null
          onboarding_completed: boolean | null
          phone: string | null
          qr_code_token: string | null
          reputation_score: number | null
          role: string
          sector: string | null
          siren: string | null
          stripe_customer_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          id: string
          is_founder?: boolean | null
          onboarding_completed?: boolean | null
          phone?: string | null
          qr_code_token?: string | null
          reputation_score?: number | null
          role: string
          sector?: string | null
          siren?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          is_founder?: boolean | null
          onboarding_completed?: boolean | null
          phone?: string | null
          qr_code_token?: string | null
          reputation_score?: number | null
          role?: string
          sector?: string | null
          siren?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      introductions_safe: {
        Row: {
          besoin_id: string | null
          commission_amount: number | null
          created_at: string | null
          deal_amount: number | null
          entreprise_confirmed: boolean | null
          facilitateur_confirmed: boolean | null
          facilitateur_id: string | null
          id: string | null
          proof_count: number | null
          prospect_company: string | null
          prospect_email: string | null
          prospect_name: string | null
          prospect_phone: string | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          besoin_id?: string | null
          commission_amount?: number | null
          created_at?: string | null
          deal_amount?: number | null
          entreprise_confirmed?: boolean | null
          facilitateur_confirmed?: boolean | null
          facilitateur_id?: string | null
          id?: string | null
          proof_count?: number | null
          prospect_company?: string | null
          prospect_email?: never
          prospect_name?: string | null
          prospect_phone?: never
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          besoin_id?: string | null
          commission_amount?: number | null
          created_at?: string | null
          deal_amount?: number | null
          entreprise_confirmed?: boolean | null
          facilitateur_confirmed?: boolean | null
          facilitateur_id?: string | null
          id?: string | null
          proof_count?: number | null
          prospect_company?: string | null
          prospect_email?: never
          prospect_name?: string | null
          prospect_phone?: never
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "introductions_besoin_id_fkey"
            columns: ["besoin_id"]
            isOneToOne: false
            referencedRelation: "besoins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introductions_facilitateur_id_fkey"
            columns: ["facilitateur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_profile_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      transition_introduction_status: {
        Args: { actor_id: string; intro_id: string; new_status: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
