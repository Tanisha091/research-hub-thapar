import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { ResearchPaper } from "./ResearchCard";

export type UploadPaperData = Omit<ResearchPaper, "id" | "owner"> & { owner?: string };

export const UploadPaperForm = ({ onSubmit }: { onSubmit: (paper: ResearchPaper) => void }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<UploadPaperData>({
    paperNumber: "",
    title: "",
    collaborators: [],
    date: new Date().toISOString().slice(0, 10),
    status: "in-review",
    keywords: [],
    pdfUrl: "",
  });

  const handleChange = (field: keyof UploadPaperData, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPaper: ResearchPaper = {
      id: crypto.randomUUID(),
      owner: form.owner || "you",
      ...form,
    } as ResearchPaper;
    onSubmit(newPaper);
    toast({ title: "Paper uploaded", description: "Your research paper was added locally. Connect Supabase to persist it." });
    setForm({ paperNumber: "", title: "", collaborators: [], date: new Date().toISOString().slice(0, 10), status: "in-review", keywords: [], pdfUrl: "" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paperNumber">Paper Number</Label>
          <Input id="paperNumber" value={form.paperNumber} onChange={(e) => handleChange("paperNumber", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="date">Publish/Issue Date</Label>
          <Input id="date" type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} required />
        </div>
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="collab">Collaborators (comma separated)</Label>
          <Input id="collab" value={form.collaborators.join(", ")} onChange={(e) => handleChange("collaborators", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="keywords">Keywords (comma separated)</Label>
          <Input id="keywords" value={(form.keywords || []).join(", ")} onChange={(e) => handleChange("keywords", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
        </div>
        <div>
          <Label htmlFor="pdf">PDF URL (temporary)</Label>
          <Input id="pdf" type="url" placeholder="Use a public link for now" value={form.pdfUrl} onChange={(e) => handleChange("pdfUrl", e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="hero">Upload Paper</Button>
      </div>
    </form>
  );
};
