import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ResearchPaper } from '@/components/research/ResearchCard';

export interface DatabasePaper {
  id: string;
  owner: string;
  title: string;
  paper_number: string;
  collaborators: string[];
  issue_date: string;
  status: 'published' | 'in-review' | 'draft';
  keywords: string[];
  pdf_url?: string;
  pdf_path?: string;
  created_at: string;
  updated_at: string;
}

export const useResearchPapers = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const transformPaper = (dbPaper: DatabasePaper): ResearchPaper => ({
    id: dbPaper.id,
    paperNumber: dbPaper.paper_number,
    title: dbPaper.title,
    collaborators: dbPaper.collaborators,
    date: dbPaper.issue_date,
    status: dbPaper.status,
    keywords: dbPaper.keywords,
    pdfUrl: dbPaper.pdf_url,
    owner: dbPaper.owner
  });

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('research_papers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPapers = data?.map(transformPaper) || [];
      setPapers(transformedPapers);
    } catch (error: any) {
      toast({
        title: "Failed to load papers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPaper = async (paperData: Omit<ResearchPaper, 'id' | 'owner'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload papers.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('research_papers')
        .insert({
          owner: user.id,
          title: paperData.title,
          paper_number: paperData.paperNumber,
          collaborators: paperData.collaborators,
          issue_date: paperData.date,
          status: paperData.status,
          keywords: paperData.keywords || [],
          pdf_url: paperData.pdfUrl
        })
        .select()
        .single();

      if (error) throw error;

      const newPaper = transformPaper(data);
      setPapers(prev => [newPaper, ...prev]);
      
      toast({
        title: "Paper uploaded",
        description: "Your research paper has been successfully uploaded."
      });

      return newPaper;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('papers')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('papers')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  useEffect(() => {
    fetchPapers();
  }, [user]);

  return {
    papers,
    loading,
    createPaper,
    uploadFile,
    refreshPapers: fetchPapers
  };
};