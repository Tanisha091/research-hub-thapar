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
  publish_date?: string;
  status: 'published' | 'in-review' | 'draft';
  keywords: string[];
  pdf_url?: string;
  pdf_path?: string;
  department?: string;
  co_author_ids?: string[];
  created_at: string;
  updated_at: string;
  co_authors?: Array<{
    id: string;
    full_name: string;
    department: string;
  }>;
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
    publishDate: dbPaper.publish_date,
    status: dbPaper.status,
    keywords: dbPaper.keywords,
    pdfUrl: dbPaper.pdf_url,
    owner: dbPaper.owner,
    department: dbPaper.department,
    coAuthorIds: dbPaper.co_author_ids,
    coAuthors: dbPaper.co_authors
  });

  const fetchPapers = async () => {
    console.log('Fetching papers...');
    setLoading(true);
    try {
      // Fetch papers where user is owner OR co-author
      const { data, error } = await supabase
        .from('research_papers')
        .select('*')
        .or(`owner.eq.${user?.id || 'null'},co_author_ids.cs.{${user?.id || 'null'}}`)
        .order('created_at', { ascending: false });

      console.log('Papers data:', data);
      console.log('Papers error:', error);

      if (error) throw error;

      // Fetch co-authors for papers that have co_author_ids
      const papersWithCoAuthors = await Promise.all(
        (data || []).map(async (paper: any) => {
          if (paper.co_author_ids && paper.co_author_ids.length > 0) {
            const { data: coAuthorsData } = await supabase
              .from('co_authors')
              .select('id, full_name, department')
              .in('id', paper.co_author_ids);
            
            return {
              ...paper,
              co_authors: coAuthorsData || []
            };
          }
          return {
            ...paper,
            co_authors: []
          };
        })
      );

      const transformedPapers = papersWithCoAuthors.map(transformPaper);
      console.log('Transformed papers:', transformedPapers);
      setPapers(transformedPapers);
    } catch (error: any) {
      console.error('Papers fetch error:', error);
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
          publish_date: paperData.publishDate || null,
          status: paperData.status,
          keywords: paperData.keywords || [],
          pdf_url: paperData.pdfUrl,
          department: paperData.department as any,
          co_author_ids: paperData.coAuthorIds || []
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch co-authors for the new paper
      let coAuthors: any[] = [];
      if (data.co_author_ids && data.co_author_ids.length > 0) {
        const { data: coAuthorsData } = await supabase
          .from('co_authors')
          .select('id, full_name, department')
          .in('id', data.co_author_ids);
        coAuthors = coAuthorsData || [];
      }

      const newPaper = transformPaper({
        ...data,
        co_authors: coAuthors
      });
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