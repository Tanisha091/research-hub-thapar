import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { ResearchPaper } from "./ResearchCard";
import { FileUpload } from "./FileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useCoAuthors } from "@/hooks/useCoAuthors";

export type UploadPaperData = Omit<ResearchPaper, "id" | "owner"> & { owner?: string };

const DEPARTMENTS = [
  { value: 'csed', label: 'Computer Science & Engineering (CSED)' },
  { value: 'eced', label: 'Electronics & Communication Engineering (ECED)' },
  { value: 'mced', label: 'Mechanical Engineering (MCED)' },
  { value: 'eid', label: 'Electrical & Instrumentation Engineering (EID)' },
  { value: 'med', label: 'Metallurgical Engineering (MED)' },
  { value: 'btd', label: 'Biotechnology (BTD)' },
  { value: 'ees', label: 'Energy & Environmental Sciences (EES)' },
  { value: 'ced', label: 'Civil Engineering (CED)' },
];

export const EnhancedUploadPaperForm = ({ onSubmit }: { onSubmit: (paper: Omit<ResearchPaper, 'id' | 'owner'>) => Promise<ResearchPaper | null> }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { coAuthors, loading: coAuthorsLoading } = useCoAuthors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<UploadPaperData>({
    paperNumber: "",
    title: "",
    collaborators: [],
    date: new Date().toISOString().slice(0, 10),
    publishDate: "",
    status: "in-review",
    keywords: [],
    pdfUrl: "",
    department: undefined,
    coAuthorIds: [],
  });

  const handleChange = (field: keyof UploadPaperData, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleCoAuthorChange = (coAuthorId: string) => {
    if (coAuthorId === "none") {
      handleChange("coAuthorIds", []);
    } else {
      handleChange("coAuthorIds", [coAuthorId]);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload papers.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await onSubmit(form);
      
      if (result) {
        setForm({ 
          paperNumber: "", 
          title: "", 
          collaborators: [], 
          date: new Date().toISOString().slice(0, 10), 
          publishDate: "",
          status: "in-review", 
          keywords: [], 
          pdfUrl: "",
          department: undefined,
          coAuthorIds: [],
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paperNumber">Paper Number</Label>
          <Input id="paperNumber" value={form.paperNumber} onChange={(e) => handleChange("paperNumber", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={form.department || ""} onValueChange={(v) => handleChange("department", v || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(dept => (
                <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Upload Date</Label>
          <Input id="date" type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="publishDate">Publish Date (optional)</Label>
          <Input id="publishDate" type="date" value={form.publishDate || ""} onChange={(e) => handleChange("publishDate", e.target.value || undefined)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="collab">Additional Collaborators (comma separated)</Label>
          <Input 
            id="collab" 
            value={form.collaborators.join(", ")} 
            onChange={(e) => handleChange("collaborators", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="Enter external collaborators" 
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => handleChange("status", v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Co-Author from Thapar Institute</Label>
        <Select 
          value={(form.coAuthorIds && form.coAuthorIds[0]) || "none"} 
          onValueChange={handleCoAuthorChange}
          disabled={coAuthorsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select co-author" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Co-Author</SelectItem>
            {coAuthors.map((coAuthor) => (
              <SelectItem key={coAuthor.id} value={coAuthor.id}>
                {coAuthor.full_name} ({coAuthor.department.toUpperCase()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="keywords">Keywords (comma separated)</Label>
          <Input id="keywords" value={(form.keywords || []).join(", ")} onChange={(e) => handleChange("keywords", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
        </div>
        <div>
          <FileUpload 
            onFileUpload={(url) => handleChange("pdfUrl", url)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="hero" disabled={isSubmitting || !user}>
          {isSubmitting ? "Uploading..." : "Upload Paper"}
        </Button>
      </div>
      {!user && (
        <p className="text-sm text-muted-foreground text-center">
          Please log in to upload papers.
        </p>
      )}
    </form>
  );
};