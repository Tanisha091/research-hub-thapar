import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const fetchCoAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from('co_authors')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setCoAuthors(data || []);
    } catch (error: any) {
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
    fetchCoAuthors();
  }, []);

  return {
    coAuthors,
    loading,
    refreshCoAuthors: fetchCoAuthors
  };
};