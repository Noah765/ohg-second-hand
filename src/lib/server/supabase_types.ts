export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      bookmarks: {
        Row: {
          id: number
          offer: string
          user: string
        }
        Insert: {
          id?: number
          offer: string
          user: string
        }
        Update: {
          id?: number
          offer?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_offer_fkey"
            columns: ["offer"]
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_offer_fkey"
            columns: ["offer"]
            referencedRelation: "random_offer_images"
            referencedColumns: ["offer"]
          },
          {
            foreignKeyName: "bookmarks_user_fkey"
            columns: ["user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_reports: {
        Row: {
          chat: number
          created_at: string | null
          description: string | null
          id: number
          reporter: string
          type: number
        }
        Insert: {
          chat: number
          created_at?: string | null
          description?: string | null
          id?: number
          reporter: string
          type: number
        }
        Update: {
          chat?: number
          created_at?: string | null
          description?: string | null
          id?: number
          reporter?: string
          type?: number
        }
        Relationships: [
          {
            foreignKeyName: "chat_reports_chat_fkey"
            columns: ["chat"]
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_reports_chat_fkey"
            columns: ["chat"]
            referencedRelation: "my_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_reports_reporter_fkey"
            columns: ["reporter"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chats: {
        Row: {
          id: number
          offer: string
          user: string
        }
        Insert: {
          id?: number
          offer: string
          user: string
        }
        Update: {
          id?: number
          offer?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_offer_fkey"
            columns: ["offer"]
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_offer_fkey"
            columns: ["offer"]
            referencedRelation: "random_offer_images"
            referencedColumns: ["offer"]
          },
          {
            foreignKeyName: "chats_user_fkey"
            columns: ["user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          chat: number
          created_at: string | null
          id: number
          images: string[] | null
          message: string | null
          receiver: string
          seen: boolean
          sender: string
        }
        Insert: {
          chat: number
          created_at?: string | null
          id?: number
          images?: string[] | null
          message?: string | null
          receiver: string
          seen?: boolean
          sender: string
        }
        Update: {
          chat?: number
          created_at?: string | null
          id?: number
          images?: string[] | null
          message?: string | null
          receiver?: string
          seen?: boolean
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_fkey"
            columns: ["chat"]
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chat_fkey"
            columns: ["chat"]
            referencedRelation: "my_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_fkey"
            columns: ["receiver"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_fkey"
            columns: ["sender"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      offer_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          offer: string
          reporter: string
          type: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          offer: string
          reporter: string
          type: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          offer?: string
          reporter?: string
          type?: number
        }
        Relationships: [
          {
            foreignKeyName: "offer_reports_offer_fkey"
            columns: ["offer"]
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_reports_offer_fkey"
            columns: ["offer"]
            referencedRelation: "random_offer_images"
            referencedColumns: ["offer"]
          },
          {
            foreignKeyName: "offer_reports_reporter_fkey"
            columns: ["reporter"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      offers: {
        Row: {
          category: number
          created_at: string | null
          creator: string
          description: string | null
          hidden: boolean
          id: string
          images: string[] | null
          price: number | null
          price_fixed: boolean | null
          title: string
          ts: unknown | null
        }
        Insert: {
          category: number
          created_at?: string | null
          creator: string
          description?: string | null
          hidden: boolean
          id?: string
          images?: string[] | null
          price?: number | null
          price_fixed?: boolean | null
          title: string
          ts?: unknown | null
        }
        Update: {
          category?: number
          created_at?: string | null
          creator?: string
          description?: string | null
          hidden?: boolean
          id?: string
          images?: string[] | null
          price?: number | null
          price_fixed?: boolean | null
          title?: string
          ts?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_creator_fkey"
            columns: ["creator"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
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
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      my_chats: {
        Row: {
          id: number | null
          offer: string | null
          user: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_offer_fkey"
            columns: ["offer"]
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_offer_fkey"
            columns: ["offer"]
            referencedRelation: "random_offer_images"
            referencedColumns: ["offer"]
          },
          {
            foreignKeyName: "chats_user_fkey"
            columns: ["user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      random_offer_images: {
        Row: {
          image: string | null
          offer: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      delete_chat_reports_account: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      delete_chats_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      delete_unverified_user: {
        Args: {
          email: string
        }
        Returns: undefined
      }
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_other_user: {
        Args: {
          user_id: string
        }
        Returns: Record<string, unknown>
      }
      get_user: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>
      }
      get_user_blocked: {
        Args: {
          email: string
          password: string
        }
        Returns: Record<string, unknown>
      }
      is_blocked: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_email_used: {
        Args: {
          email: string
        }
        Returns: boolean
      }
      update_message_seen: {
        Args: {
          chat: string
        }
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objects_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_matching_own_images: {
        Args: {
          images: string[]
          bucket_id: string
        }
        Returns: number
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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
