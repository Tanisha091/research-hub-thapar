import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ResearchCard, type ResearchPaper } from "@/components/research/ResearchCard";
import { SearchAndFilters, type Filters } from "@/components/research/SearchAndFilters";
import { UploadPaperForm } from "@/components/research/UploadPaperForm";

const initialPapers: ResearchPaper[] = [
  {
    id: "1",
    paperNumber: "TIET-2004-001",
    title: "MY RESEARCH",
    collaborators: ["Avi"],
    date: "2004-06-01",
    status: "published",
    keywords: ["AI"],
    pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf",
    owner: "avi",
  },
  {
    id: "2",
    paperNumber: "TIET-2004-002",
    title: "My research",
    collaborators: ["Avi"],
    date: "2004-07-15",
    status: "in-review",
    keywords: ["AI"],
    pdfUrl: "https://arxiv.org/pdf/1609.08144.pdf",
    owner: "you",
  },
];

const Index = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>(initialPapers);
  const [filters, setFilters] = useState<Filters>({ query: "", status: "all", collaborator: "" });
  const [tab, setTab] = useState<string>("browse");
  const location = useLocation();

  useEffect(() => {
    document.title = "ThaparAcad Research Portal";
    const t = (location.state as any)?.tab;
    if (t) setTab(t);
  }, [location.state]);

  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase();
    return papers.filter((p) => {
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.keywords?.some((k) => k.toLowerCase().includes(q)) ||
        p.collaborators.some((c) => c.toLowerCase().includes(q));
      const matchStatus = filters.status === "all" || p.status === filters.status;
      const matchCollab =
        !filters.collaborator ||
        p.collaborators.some((c) => c.toLowerCase().includes(filters.collaborator.toLowerCase()));
      return matchQuery && matchStatus && matchCollab;
    });
  }, [papers, filters]);

  const myPapers = useMemo(() => papers.filter((p) => p.owner === "you"), [papers]);

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
              {filtered.map((p) => (
                <ResearchCard key={p.id} paper={p} />
              ))}
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <UploadPaperForm onSubmit={(paper) => setPapers((arr) => [paper, ...arr])} />
            </TabsContent>
            <TabsContent value="my" className="space-y-4 mt-4">
              {myPapers.length === 0 ? (
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
