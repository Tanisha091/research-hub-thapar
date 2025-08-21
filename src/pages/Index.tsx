import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ResearchCard, type ResearchPaper } from "@/components/research/ResearchCard";
import { SearchAndFilters, type Filters } from "@/components/research/SearchAndFilters";
import { UploadPaperForm } from "@/components/research/UploadPaperForm";
import { useAuth } from "@/contexts/AuthContext";
import { useResearchPapers } from "@/hooks/useResearchPapers";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [filters, setFilters] = useState<Filters>({ 
    query: "", 
    status: "all", 
    collaborator: "", 
    department: "",
    coAuthor: "",
    uploadDateFrom: "",
    uploadDateTo: "",
    publishDateFrom: "",
    publishDateTo: ""
  });
  const [tab, setTab] = useState<string>("browse");
  const location = useLocation();
  const { user } = useAuth();
  const { papers, loading, createPaper } = useResearchPapers();

  useEffect(() => {
    document.title = "ThaparAcad Research Portal";
    const t = (location.state as any)?.tab;
    if (t) setTab(t);
  }, [location.state]);

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

      return matchQuery && matchStatus && matchCollab;
    });
  }, [papers, filters]);

  const myPapers = useMemo(() => papers.filter((p) => p.owner === user?.id), [papers, user]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-10">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Research Portal</h1>
          <p className="text-muted-foreground mb-6">Browse research, upload new papers, and manage your work.</p>
          <Card className="hero-surface">
            <CardContent className="p-6">
              <SearchAndFilters value={filters} onChange={setFilters} />
            </CardContent>
          </Card>
        </section>
        <section>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="browse">Browse Papers</TabsTrigger>
              <TabsTrigger value="upload">Upload Paper</TabsTrigger>
              <TabsTrigger value="my">My Papers</TabsTrigger>
            </TabsList>
            <TabsContent value="browse" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Found {filtered.length} papers</p>
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
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <UploadPaperForm onSubmit={createPaper} />
            </TabsContent>
            <TabsContent value="my" className="space-y-4 mt-4">
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
            </TabsContent>
          </Tabs>
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
