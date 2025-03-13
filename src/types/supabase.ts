
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          is_admin: boolean
        }
        Insert: {
          id: string
          name: string
          email: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          name?: string
          email?: string
          is_admin?: boolean
        }
      }
      bills: {
        Row: {
          id: string
          vendor_name: string
          amount: number
          due_date: string
          category: string
          status: 'paid' | 'unpaid'
          notes: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          vendor_name: string
          amount: number
          due_date: string
          category: string
          status: 'paid' | 'unpaid'
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          vendor_name?: string
          amount?: number
          due_date?: string
          category?: string
          status?: 'paid' | 'unpaid'
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Bill = Database['public']['Tables']['bills']['Row']
export type BillInsert = Database['public']['Tables']['bills']['Insert']
export type BillUpdate = Database['public']['Tables']['bills']['Update']
