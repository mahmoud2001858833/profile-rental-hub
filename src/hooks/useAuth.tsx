import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserType = 'customer' | 'merchant' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userType: UserType;
  signUp: (email: string, password: string, phone: string) => Promise<{ error: Error | null }>;
  signUpCustomer: (email: string, password: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check user type after auth state change
        if (session?.user) {
          setTimeout(() => {
            checkUserType(session.user.id);
          }, 0);
        } else {
          setUserType(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        checkUserType(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserType = async (userId: string) => {
    // Check if user is a merchant
    const { data: merchantProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (merchantProfile) {
      setUserType('merchant');
      return;
    }

    // Check if user is a customer
    const { data: customerProfile } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (customerProfile) {
      setUserType('customer');
      return;
    }

    setUserType(null);
  };

  const signUp = async (email: string, password: string, phone: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { phone, user_type: 'merchant' }
      }
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        phone: phone,
        display_name: '',
        page_slug: `user-${Date.now()}`,
        user_type: 'merchant'
      });
      
      if (profileError) {
        return { error: new Error(profileError.message) };
      }

      // Check if this is an admin phone number and assign admin role
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const adminPhones = ['0799126390', '962799126390', '0795666158', '962795666158'];
      if (adminPhones.some(adminPhone => cleanPhone === adminPhone || cleanPhone === adminPhone.replace(/^0/, ''))) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'admin'
        });
      }
    }

    return { error: error ? new Error(error.message) : null };
  };

  const signUpCustomer = async (email: string, password: string, phone: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { phone, user_type: 'customer' }
      }
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase.from('customer_profiles').insert({
        user_id: data.user.id,
        phone: phone,
        display_name: ''
      });
      
      if (profileError) {
        return { error: new Error(profileError.message) };
      }

      // Check if this is an admin phone number and assign admin role
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const adminPhones = ['0799126390', '962799126390', '0795666158', '962795666158'];
      if (adminPhones.some(adminPhone => cleanPhone === adminPhone || cleanPhone === adminPhone.replace(/^0/, ''))) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'admin'
        });
      }
    }

    return { error: error ? new Error(error.message) : null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userType, signUp, signUpCustomer, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
