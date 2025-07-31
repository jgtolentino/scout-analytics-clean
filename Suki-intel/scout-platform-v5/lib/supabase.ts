import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to fetch data with error handling
export async function fetchData(table: string, query?: any) {
  try {
    let request = supabase.from(table).select('*')
    
    if (query) {
      // Apply any additional query parameters
      Object.entries(query).forEach(([key, value]) => {
        if (key === 'limit') {
          request = request.limit(value as number)
        } else if (key === 'orderBy') {
          request = request.order(value as string)
        }
      })
    }
    
    const { data, error } = await request
    
    if (error) {
      console.error(`Error fetching from ${table}:`, error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error)
    return []
  }
}