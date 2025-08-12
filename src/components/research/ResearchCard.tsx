import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ResearchPaper = {
  id: string;
  paperNumber: string;
  title: string;
  collaborators: string[];
  date: string; // ISO string
  status: "published" | "in-review" | "draft";
  keywords?: string[];
  pdfUrl?: string;
  owner: string;
};

type Props = {
  paper: ResearchPaper;
};

export const ResearchCard = ({ paper }: Props) => {
  const year = new Date(paper.date).getFullYear();
  return (
    <Card className="hover:shadow-xl transition-shadow">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">{paper.title}</CardTitle>
          <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-3">
            <span>#{paper.paperNumber}</span>
            <span>{year}</span>
            <span>{paper.collaborators.join(", ")}</span>
          </div>
        </div>
        <Badge variant="secondary">
          {paper.status === "in-review" ? "In Review" : paper.status === "draft" ? "Draft" : "Published"}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {paper.keywords && paper.keywords.length > 0 && (
            <p>
              Keywords: {paper.keywords.join(", ")}
            </p>
          )}
        </div>
        {paper.pdfUrl && (
          <Button asChild variant="outline">
            <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" aria-label="View PDF">
              View PDF
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
