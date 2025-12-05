import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GraduationCap, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Import,
  Link,
  User,
  Quote
} from "lucide-react";

interface ScholarPublication {
  title: string;
  authors: string;
  year: string;
  citations: number;
  link?: string;
  publication?: string;
}

interface ScholarAuthor {
  name: string | null;
  affiliations: string | null;
  email: string | null;
  thumbnail: string | null;
  citedBy: any;
}

interface GoogleScholarImportProps {
  onImport?: (papers: Partial<any>[]) => void;
}

export const GoogleScholarImport = ({ onImport }: GoogleScholarImportProps) => {
  const [scholarId, setScholarId] = useState("");
  const [savedScholarId, setSavedScholarId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [publications, setPublications] = useState<ScholarPublication[]>([]);
  const [author, setAuthor] = useState<ScholarAuthor | null>(null);
  const [selectedPubs, setSelectedPubs] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load saved Scholar ID from user profile
  useEffect(() => {
    const loadScholarId = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('google_scholar_id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (data?.google_scholar_id) {
        setSavedScholarId(data.google_scholar_id);
        setScholarId(data.google_scholar_id);
      }
    };
    
    loadScholarId();
  }, [user]);

  const handleSaveScholarId = async () => {
    if (!user || !scholarId.trim()) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ google_scholar_id: scholarId.trim() })
        .eq('auth_user_id', user.id);
      
      if (error) throw error;
      
      setSavedScholarId(scholarId.trim());
      toast({
        title: "Saved",
        description: "Google Scholar ID saved to your profile",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save Scholar ID",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFetchPublications = async () => {
    const idToFetch = scholarId.trim();
    if (!idToFetch) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a Google Scholar ID",
      });
      return;
    }

    setIsFetching(true);
    setPublications([]);
    setAuthor(null);
    setSelectedPubs(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('fetch-google-scholar', {
        body: { scholarId: idToFetch }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.message || data.error);
      }

      if (data?.publications && data.publications.length > 0) {
        setPublications(data.publications);
        setAuthor(data.author || null);
        toast({
          title: "Success",
          description: `Found ${data.publications.length} publications`,
        });
      } else {
        toast({
          title: "No Results",
          description: "No publications found for this Scholar ID",
        });
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch from Google Scholar",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const togglePublication = (index: number) => {
    setSelectedPubs(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPubs.size === publications.length) {
      setSelectedPubs(new Set());
    } else {
      setSelectedPubs(new Set(publications.map((_, i) => i)));
    }
  };

  const handleImportSelected = async () => {
    if (selectedPubs.size === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one publication to import",
      });
      return;
    }

    setIsImporting(true);
    try {
      const papersToImport = Array.from(selectedPubs).map(index => {
        const pub = publications[index];
        return {
          title: pub.title,
          authors: pub.authors ? pub.authors.split(',').map(a => a.trim()) : [],
          publication_year: pub.year ? parseInt(pub.year) : null,
          doi: pub.link || null,
          status: 'draft' as const,
        };
      });

      if (onImport) {
        onImport(papersToImport);
      }

      // Insert papers into database
      for (const paper of papersToImport) {
        const { error } = await supabase
          .from('research_papers')
          .insert({
            title: paper.title,
            authors: paper.authors,
            publication_year: paper.publication_year,
            doi: paper.doi,
            status: 'draft',
            owner: user?.id,
            collaborators: [],
            keywords: [],
          });

        if (error) {
          console.error("Insert error:", error);
        }
      }

      toast({
        title: "Success",
        description: `Imported ${papersToImport.length} publications as drafts`,
      });
      
      setSelectedPubs(new Set());
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to import publications",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Import from Google Scholar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scholar ID Input */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Link your Google Scholar profile to import your publications. Your Scholar ID can be found in your profile URL.
          </p>
          
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="scholar-id">Google Scholar ID</Label>
              <Input
                id="scholar-id"
                placeholder="e.g., ABC123xyz"
                value={scholarId}
                onChange={(e) => setScholarId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Find it at: scholar.google.com/citations?user=<span className="font-mono bg-muted px-1 rounded">YOUR_ID</span>
              </p>
            </div>
            
            {scholarId !== savedScholarId && scholarId.trim() && (
              <Button 
                variant="outline"
                onClick={handleSaveScholarId}
                disabled={isSaving}
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Link className="h-4 w-4" />
                )}
                <span className="ml-2">Save ID</span>
              </Button>
            )}
            
            <Button 
              onClick={handleFetchPublications}
              disabled={isFetching || !scholarId.trim()}
            >
              {isFetching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Fetch Publications</span>
            </Button>
          </div>
          
          {savedScholarId && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Link className="h-3 w-3" />
              Scholar ID linked to your profile
            </p>
          )}
        </div>

        {/* Author Info */}
        {author && author.name && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                {author.thumbnail && (
                  <img 
                    src={author.thumbnail} 
                    alt={author.name} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{author.name}</span>
                  </div>
                  {author.affiliations && (
                    <p className="text-sm text-muted-foreground">{author.affiliations}</p>
                  )}
                  {author.citedBy && (
                    <div className="flex gap-4 text-sm mt-2">
                      <Badge variant="secondary">
                        <Quote className="h-3 w-3 mr-1" />
                        {author.citedBy[0]?.citations?.all || 0} total citations
                      </Badge>
                      <Badge variant="outline">
                        h-index: {author.citedBy[1]?.h_index?.all || 0}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Publications List */}
        {publications.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Publications ({publications.length})</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedPubs.size === publications.length ? "Deselect All" : "Select All"}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleImportSelected}
                  disabled={selectedPubs.size === 0 || isImporting}
                >
                  {isImporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Import className="h-4 w-4 mr-2" />
                  )}
                  Import Selected ({selectedPubs.size})
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {publications.map((pub, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedPubs.has(index) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => togglePublication(index)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={selectedPubs.has(index)}
                        onCheckedChange={() => togglePublication(index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm leading-tight">{pub.title}</h4>
                          {pub.link && (
                            <a 
                              href={pub.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-primary shrink-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {pub.authors && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{pub.authors}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          {pub.year && (
                            <Badge variant="outline" className="text-xs">{pub.year}</Badge>
                          )}
                          {pub.citations > 0 && (
                            <span className="text-muted-foreground">
                              <Quote className="h-3 w-3 inline mr-1" />
                              {pub.citations} citations
                            </span>
                          )}
                          {pub.publication && (
                            <span className="text-muted-foreground truncate max-w-[200px]">
                              {pub.publication}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {!isFetching && publications.length === 0 && savedScholarId && (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Fetch Publications" to load your Google Scholar papers</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
