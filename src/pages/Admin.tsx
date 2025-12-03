import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useResearchPapers } from "@/hooks/useResearchPapers";
import { ResearchCard } from "@/components/research/ResearchCard";
import { EnhancedUploadPaperForm } from "@/components/research/EnhancedUploadPaperForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  FileText, 
  Download, 
  Filter,
  BarChart3,
  Upload,
  Eye,
  RefreshCw,
  Search
} from "lucide-react";

const DEPARTMENTS = [
  { id: "all", name: "All Departments" },
  { id: "csed", name: "Computer Science & Engineering" },
  { id: "eced", name: "Electronics & Communication" },
  { id: "mced", name: "Mechanical Engineering" },
  { id: "eid", name: "Electrical & Instrumentation" },
  { id: "med", name: "Mathematics" },
  { id: "btd", name: "Biotechnology" },
  { id: "ees", name: "Environmental Science" },
  { id: "ced", name: "Civil Engineering" },
];

const CONTENT_TYPES = [
  { id: "all", name: "All Types" },
  { id: "research_paper", name: "Research Papers" },
  { id: "certification", name: "Certifications" },
  { id: "conference", name: "Conferences" },
  { id: "patent", name: "Patents" },
];

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { papers, loading: papersLoading, createPaper, refreshPapers } = useResearchPapers();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Report filters
  const [reportFilters, setReportFilters] = useState({
    department: "all",
    contentType: "all",
    dateFrom: "",
    dateTo: "",
    title: "",
    status: "all"
  });

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    inReview: 0,
    draft: 0,
    byDepartment: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard | ThaparAcad";
  }, []);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      return;
    }

    const fetchStats = async () => {
      try {
        const { data: papers, error } = await supabase
          .from('research_papers')
          .select('status, department');

        if (error) throw error;

        const total = papers?.length || 0;
        const published = papers?.filter(p => p.status === 'published').length || 0;
        const inReview = papers?.filter(p => p.status === 'in-review').length || 0;
        const draft = papers?.filter(p => p.status === 'draft').length || 0;

        // Group by department
        const byDepartment: Record<string, number> = {};
        papers?.forEach(p => {
          if (p.department) {
            byDepartment[p.department] = (byDepartment[p.department] || 0) + 1;
          }
        });

        setStats({ total, published, inReview, draft, byDepartment });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!roleLoading && isAdmin) {
      fetchStats();
    }
  }, [isAdmin, roleLoading, navigate]);

  // Filter papers for report
  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      const matchDept = reportFilters.department === "all" || p.department === reportFilters.department;
      const matchStatus = reportFilters.status === "all" || p.status === reportFilters.status;
      const matchTitle = !reportFilters.title || p.title.toLowerCase().includes(reportFilters.title.toLowerCase());
      const matchDateFrom = !reportFilters.dateFrom || p.date >= reportFilters.dateFrom;
      const matchDateTo = !reportFilters.dateTo || p.date <= reportFilters.dateTo;
      
      return matchDept && matchStatus && matchTitle && matchDateFrom && matchDateTo;
    });
  }, [papers, reportFilters]);

  const handleExportCSV = () => {
    const headers = ["Title", "Department", "Status", "Authors", "Keywords", "Upload Date", "Publish Date", "DOI"];
    const rows = filteredPapers.map(p => [
      p.title,
      p.department || "",
      p.status,
      p.collaborators.join("; "),
      p.keywords?.join("; ") || "",
      p.date,
      p.publishDate || "",
      p.doi || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `research_papers_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Export Successful",
      description: `Exported ${filteredPapers.length} papers to CSV`,
    });
  };

  const handleExportJSON = () => {
    const exportData = filteredPapers.map(p => ({
      title: p.title,
      department: p.department,
      status: p.status,
      authors: p.collaborators,
      keywords: p.keywords,
      uploadDate: p.date,
      publishDate: p.publishDate,
      doi: p.doi,
      abstract: p.abstract
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `research_papers_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    toast({
      title: "Export Successful",
      description: `Exported ${filteredPapers.length} papers to JSON`,
    });
  };

  if (roleLoading || loading) {
    return (
      <main className="container mx-auto py-10">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage papers and generate reports</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="papers" className="gap-2">
            <Eye className="h-4 w-4" />
            All Papers
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Reports
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Paper
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Papers</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold text-primary">{stats.total}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Published</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold text-green-600">{stats.published}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>In Review</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold text-amber-600">{stats.inReview}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Draft</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold text-muted-foreground">{stats.draft}</CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Papers by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DEPARTMENTS.filter(d => d.id !== "all").map(dept => (
                  <div key={dept.id} className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">{dept.name}</p>
                    <p className="text-2xl font-bold">{stats.byDepartment[dept.id] || 0}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="papers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Research Papers</CardTitle>
                <Button variant="outline" size="icon" onClick={() => refreshPapers()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {papersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : papers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No papers found</p>
              ) : (
                <div className="space-y-4">
                    {papers.map((paper) => (
                      <ResearchCard key={paper.id} paper={paper} />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select 
                    value={reportFilters.department} 
                    onValueChange={(v) => setReportFilters({...reportFilters, department: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select 
                    value={reportFilters.contentType} 
                    onValueChange={(v) => setReportFilters({...reportFilters, contentType: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={reportFilters.status} 
                    onValueChange={(v) => setReportFilters({...reportFilters, status: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input 
                    type="date" 
                    value={reportFilters.dateFrom}
                    onChange={(e) => setReportFilters({...reportFilters, dateFrom: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input 
                    type="date" 
                    value={reportFilters.dateTo}
                    onChange={(e) => setReportFilters({...reportFilters, dateTo: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Title Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by title..."
                      className="pl-9"
                      value={reportFilters.title}
                      onChange={(e) => setReportFilters({...reportFilters, title: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <p className="text-muted-foreground">
                  Found <span className="font-semibold text-foreground">{filteredPapers.length}</span> papers matching filters
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button variant="outline" onClick={handleExportJSON} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export JSON
                  </Button>
                </div>
              </div>

              {/* Preview of filtered results */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Preview ({Math.min(5, filteredPapers.length)} of {filteredPapers.length})</h3>
                {filteredPapers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No papers match the current filters</p>
                ) : (
                  <div className="space-y-4">
                    {filteredPapers.slice(0, 5).map((paper) => (
                      <ResearchCard key={paper.id} paper={paper} />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <EnhancedUploadPaperForm onSubmit={createPaper} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Admin;