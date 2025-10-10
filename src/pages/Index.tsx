import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResearchCard, type ResearchPaper } from "@/components/research/ResearchCard";
import { EnhancedSearchAndFilters, type EnhancedFilters } from "@/components/research/EnhancedSearchAndFilters";
import { FilterDrawer } from "@/components/research/FilterDrawer";
import { Input } from "@/components/ui/input";
import { EnhancedUploadPaperForm } from "@/components/research/EnhancedUploadPaperForm";
import { useAuth } from "@/contexts/AuthContext";
import { useResearchPapers } from "@/hooks/useResearchPapers";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { Home, Upload, FileText } from "lucide-react";

const Index = () => {
  const [filters, setFilters] = useState<EnhancedFilters>({ 
    query: "", 
    status: "all", 
    collaborator: "", 
    department: "all",
    coAuthor: "",
    uploadDateFrom: "",
    uploadDateTo: "",
    publishDateFrom: "",
    publishDateTo: ""
  });
  const [view, setView] = useState<"browse" | "upload" | "my">("browse");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { papers, loading, createPaper } = useResearchPapers();
  const { role, isAdmin, isTeacher } = useUserRole();

  useEffect(() => {
    document.title = "ThaparAcad Research Portal";
  }, []);

  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase();
    return papers.filter((p) => {
      // Search query match
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.keywords?.some((k) => k.toLowerCase().includes(q)) ||
        p.collaborators.some((c) => c.toLowerCase().includes(q)) ||
        p.coAuthors?.some((ca) => ca.full_name.toLowerCase().includes(q));

      // Status match
      const matchStatus = filters.status === "all" || p.status === filters.status;

      // External collaborator match
      const matchCollab =
        !filters.collaborator ||
        p.collaborators.some((c) => c.toLowerCase().includes(filters.collaborator.toLowerCase()));

      // Department match
      const matchDept = filters.department === "all" || p.department === filters.department;

      // Co-author match
      const matchCoAuthor = !filters.coAuthor || filters.coAuthor === "all" || p.coAuthorIds?.includes(filters.coAuthor);

      // Upload date range match
      const matchUploadDate = (!filters.uploadDateFrom || p.date >= filters.uploadDateFrom) &&
                             (!filters.uploadDateTo || p.date <= filters.uploadDateTo);

      // Publish date range match
      const matchPublishDate = (!filters.publishDateFrom || (p.publishDate && p.publishDate >= filters.publishDateFrom)) &&
                              (!filters.publishDateTo || (p.publishDate && p.publishDate <= filters.publishDateTo));

      return matchQuery && matchStatus && matchCollab && matchDept && matchCoAuthor && matchUploadDate && matchPublishDate;
    });
  }, [papers, filters]);

  const myPapers = useMemo(() => papers.filter((p) => p.owner === user?.id), [papers, user]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-10">
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isAdmin ? "Admin Dashboard" : isTeacher ? "Teacher Dashboard" : "Research Portal"}
              </h1>
              <p className="text-muted-foreground">
                {isAdmin ? "Manage all papers and generate reports" : isTeacher ? "Upload and manage your research papers" : "Browse research papers"}
              </p>
            </div>
            {user && (isTeacher || isAdmin) && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setView("browse");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
                <Button onClick={() => setView("upload")} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Paper
                </Button>
                {isAdmin && (
                  <Button variant="secondary" onClick={() => navigate("/admin")} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </Button>
                )}
              </div>
            )}
          </div>
          <Card className="hero-surface">
            <CardContent className="p-6">
              <div className="flex gap-3 items-start">
                <Input
                  placeholder="Search papers, authors, keywords..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  aria-label="Search papers"
                  className="max-w-md"
                />
                <FilterDrawer value={filters} onChange={setFilters} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          {view === "upload" ? (
            <div className="space-y-4">
              <Button variant="ghost" onClick={() => setView("browse")}>← Back to Papers</Button>
              <EnhancedUploadPaperForm onSubmit={createPaper} />
            </div>
          ) : view === "my" ? (
            <div className="space-y-4">
              <Button variant="ghost" onClick={() => setView("browse")}>← Back to All Papers</Button>
              {!user ? (
                <p className="text-muted-foreground">Please log in to view your papers.</p>
              ) : loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : myPapers.length === 0 ? (
                <p className="text-muted-foreground">No papers yet. Upload your first paper.</p>
              ) : (
                myPapers.map((p) => <ResearchCard key={p.id} paper={p} />)
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Found {filtered.length} papers</p>
                {user && (isTeacher || isAdmin) && (
                  <Button variant="outline" onClick={() => setView("my")}>View My Papers</Button>
                )}
              </div>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                filtered.map((p) => (
                  <ResearchCard key={p.id} paper={p} />
                ))
              ) : (
                <p className="text-muted-foreground">No papers found matching your criteria.</p>
              )}
            </div>
          )}
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ThaparAcad Research Portal",
              url: "/",
              potentialAction: {
                "@type": "SearchAction",
                target: "/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </main>
    </div>
  );
};

export default Index;
