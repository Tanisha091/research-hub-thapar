import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface CoAuthor {
  id: string;
  full_name: string;
  email: string;
  department: string;
  is_active: boolean;
}

export const useCoAuthors = () => {
  const [coAuthors, setCoAuthors] = useState<CoAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!data && !error);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const fetchCoAuthors = async () => {
    console.log('Fetching co-authors...');
    try {
      const { data, error } = await supabase
        .from('co_authors')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      console.log('Co-authors data:', data);
      console.log('Co-authors error:', error);

      if (error) throw error;
      
      // For non-admin users, mask the email addresses
      const processedData = data?.map(coAuthor => ({
        ...coAuthor,
        email: isAdmin ? coAuthor.email : '[Contact admin for email]'
      })) || [];
      
      setCoAuthors(processedData);
    } catch (error: any) {
      console.error('Co-authors fetch error:', error);
      toast({
        title: "Failed to load co-authors",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  useEffect(() => {
    fetchCoAuthors();
  }, [isAdmin]);

  return {
    coAuthors,
    loading,
    isAdmin,
    refreshCoAuthors: fetchCoAuthors
  };
};