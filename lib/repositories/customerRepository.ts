import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface CustomerData {
  name: string;
  email: string;
  phone?: string | null;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

interface CustomerResult {
  customerId: string | null;
  success: boolean;
  error?: string;
}

// Create a Supabase server client using the newer API
const createClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
};

export class CustomerRepository {
  /**
   * Create or update a customer
   */
  static async upsertCustomer(customerData: CustomerData): Promise<CustomerResult> {
    try {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .upsert(customerData, { onConflict: 'email' })
        .select('id')
        .single();
        
      if (error) {
        throw new Error(`Failed to update customer: ${error.message}`);
      }
      
      return { 
        customerId: data.id,
        success: true 
      };
    } catch (error) {
      console.error('Error upserting customer:', error);
      return {
        customerId: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get customer data by ID
   */
  static async getCustomerById(customerId: string) {
    const supabase = await createClient();
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
        
      if (error) {
        throw new Error(`Failed to get customer: ${error.message}`);
      }
      
      return { 
        customer: data,
        success: true 
      };
    } catch (error) {
      console.error('Error getting customer:', error);
      return {
        customer: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get customer by email
   */
  static async getCustomerByEmail(email: string) {
    const supabase = await createClient();
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw new Error(`Failed to get customer: ${error.message}`);
      }
      
      return { 
        customer: data,
        success: !!data
      };
    } catch (error) {
      console.error('Error getting customer by email:', error);
      return {
        customer: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
