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
      co_authors: {
        Row: {
          created_at: string | null
          department: Database["public"]["Enums"]["department_type"] | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      research_papers: {
        Row: {
          abstract: string | null
          authors: string[]
          co_author_ids: string[] | null
          collaborators: string[]
          created_at: string
          department: Database["public"]["Enums"]["department_type"] | null
          doi: string | null
          file_url: string | null
          id: string
          issue_date: string
          keywords: string[]
          owner: string
          paper_number: string
          pdf_path: string | null
          pdf_url: string | null
          publication_year: number | null
          publish_date: string | null
          status: Database["public"]["Enums"]["paper_status_type"]
          title: string
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          authors?: string[]
          co_author_ids?: string[] | null
          collaborators?: string[]
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          doi?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string
          keywords?: string[]
          owner: string
          paper_number?: string
          pdf_path?: string | null
          pdf_url?: string | null
          publication_year?: number | null
          publish_date?: string | null
          status?: Database["public"]["Enums"]["paper_status_type"]
          title: string
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          authors?: string[]
          co_author_ids?: string[] | null
          collaborators?: string[]
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          doi?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string
          keywords?: string[]
          owner?: string
          paper_number?: string
          pdf_path?: string | null
          pdf_url?: string | null
          publication_year?: number | null
          publish_date?: string | null
          status?: Database["public"]["Enums"]["paper_status_type"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
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
      users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          contact_info: string | null
          created_at: string | null
          department: Database["public"]["Enums"]["department_type"] | null
          email: string
          full_name: string
          google_scholar_id: string | null
          id: string
          password_hash: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          contact_info?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          email: string
          full_name: string
          google_scholar_id?: string | null
          id?: string
          password_hash?: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          contact_info?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          email?: string
          full_name?: string
          google_scholar_id?: string | null
          id?: string
          password_hash?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      co_authors_safe: {
        Row: {
          created_at: string | null
          department: Database["public"]["Enums"]["department_type"] | null
          email: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          email?: never
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          email?: never
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_co_author_with_conditional_email: {
        Args: {
          co_author_row: Database["public"]["Tables"]["co_authors"]["Row"]
        }
        Returns: Json
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
      app_role: "admin" | "moderator" | "user"
      department_type:
        | "csed"
        | "eced"
        | "mced"
        | "eid"
        | "med"
        | "btd"
        | "ees"
        | "ced"
      paper_status_type: "published" | "in-review" | "draft"
      research_status_type: "published" | "under_review"
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
      department_type: [
        "csed",
        "eced",
        "mced",
        "eid",
        "med",
        "btd",
        "ees",
        "ced",
      ],
      paper_status_type: ["published", "in-review", "draft"],
      research_status_type: ["published", "under_review"],
    },
  },
} as const
