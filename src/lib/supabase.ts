// Placeholder Supabase client to fix schema-sync workflow
export const supabase = {
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: () => ({ 
      single: () => Promise.resolve({ data: null, error: null })
    })
  })
}