import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResearchCard, type ResearchPaper } from "@/components/research/ResearchCard";
import { EnhancedUploadPaperForm } from "@/components/research/EnhancedUploadPaperForm";
import { useAuth } from "@/contexts/AuthContext";
import { useResearchPapers } from "@/hooks/useResearchPapers";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  FileText, 
  Eye, 
  GraduationCap,
  Search,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("my-papers");
  const [searchQuery, setSearchQuery] = useState("");
  const [scholarId, setScholarId] = useState("");
  const [isFetchingScholar, setIsFetchingScholar] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { papers, loading, createPaper, refreshPapers } = useResearchPapers();
  const { isTeacher, isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Teacher Dashboard | ThaparAcad";
  }, []);

  // Redirect if not authenticated or not a teacher/admin
  useEffect(() => {
    if (!roleLoading && !user) {
      navigate("/login");
      return;
    }
    if (!roleLoading && !isTeacher && !isAdmin) {
      navigate("/");
    }
  }, [user, isTeacher, isAdmin, roleLoading, navigate]);

  const myPapers = useMemo(() => {
    return papers.filter((p) => p.owner === user?.id);
  }, [papers, user]);

  const filteredPapers = useMemo(() => {
    if (!searchQuery) return myPapers;
    const q = searchQuery.toLowerCase();
    return myPapers.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [myPapers, searchQuery]);

  const stats = useMemo(() => ({
    total: myPapers.length,
    published: myPapers.filter(p => p.status === 'published').length,
    inReview: myPapers.filter(p => p.status === 'in-review').length,
    draft: myPapers.filter(p => p.status === 'draft').length,
  }), [myPapers]);

  const handleFetchScholar = async () => {
    if (!scholarId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a Google Scholar ID",
      });
      return;
    }

    setIsFetchingScholar(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-google-scholar', {
        body: { scholarId: scholarId.trim() }
      });

      if (error) throw error;

      if (data?.publications && data.publications.length > 0) {
        toast({
          title: "Success",
          description: `Found ${data.publications.length} publications from Google Scholar`,
        });
        // Refresh papers to show any newly imported ones
        refreshPapers();
      } else {
        toast({
          title: "No Results",
          description: "No publications found for this Scholar ID",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch from Google Scholar",
      });
    } finally {
      setIsFetchingScholar(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <main className="container mx-auto py-10">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your research papers and publications
        </p>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.inReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
          </CardContent>
        </Card>
      </section>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="my-papers" className="gap-2">
            <Eye className="h-4 w-4" />
            My Papers
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload New
          </TabsTrigger>
          <TabsTrigger value="scholar" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Google Scholar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-papers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Research Papers
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search papers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => refreshPapers()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPapers.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No papers found matching your search" : "No papers uploaded yet"}
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab("upload")}>
                    Upload Your First Paper
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPapers.map((paper) => (
                    <ResearchCard key={paper.id} paper={paper} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <EnhancedUploadPaperForm onSubmit={createPaper} />
        </TabsContent>

        <TabsContent value="scholar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Import from Google Scholar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Enter your Google Scholar ID to fetch your publications. The ID can be found in your Google Scholar profile URL.
              </p>
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="scholar-id">Google Scholar ID</Label>
                  <Input
                    id="scholar-id"
                    placeholder="e.g., ABC123xyz"
                    value={scholarId}
                    onChange={(e) => setScholarId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Find it in your Scholar profile URL: scholar.google.com/citations?user=<strong>YOUR_ID</strong>
                  </p>
                </div>
                <Button 
                  onClick={handleFetchScholar} 
                  disabled={isFetchingScholar}
                  className="gap-2"
                >
                  {isFetchingScholar ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Fetch Publications
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default TeacherDashboard;