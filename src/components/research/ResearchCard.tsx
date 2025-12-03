import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ResearchPaper = {
  id: string;
  paperNumber: string;
  title: string;
  collaborators: string[];
  date: string; // ISO string
  publishDate?: string;
  status: "published" | "in-review" | "draft";
  keywords?: string[];
  pdfUrl?: string;
  owner: string;
  department?: string;
  coAuthorIds?: string[];
  coAuthors?: Array<{
    id: string;
    full_name: string;
    department: string;
  }>;
  doi?: string;
  abstract?: string;
};

type Props = {
  paper: ResearchPaper;
};

export const ResearchCard = ({ paper }: Props) => {
  const year = new Date(paper.date).getFullYear();
  const publishYear = paper.publishDate ? new Date(paper.publishDate).getFullYear() : null;
  
  return (
    <Card className="hover:shadow-xl transition-shadow">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-lg">{paper.title}</CardTitle>
          <div className="mt-2 text-sm text-muted-foreground space-y-1">
            <div className="flex flex-wrap gap-3">
              <span>#{paper.paperNumber}</span>
              <span>Uploaded: {year}</span>
              {publishYear && <span>Published: {publishYear}</span>}
              {paper.department && (
                <Badge variant="outline" className="text-xs">
                  {paper.department.toUpperCase()}
                </Badge>
              )}
            </div>
            {paper.collaborators.length > 0 && (
              <div>
                <span className="font-medium">External: </span>
                <span>{paper.collaborators.join(", ")}</span>
              </div>
            )}
            {paper.coAuthors && paper.coAuthors.length > 0 && (
              <div>
                <span className="font-medium">Co-Authors: </span>
                <span>{paper.coAuthors.map(ca => `${ca.full_name} (${ca.department.toUpperCase()})`).join(", ")}</span>
              </div>
            )}
          </div>
        </div>
        <Badge variant="secondary">
          {paper.status === "in-review" ? "In Review" : paper.status === "draft" ? "Draft" : "Published"}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {paper.keywords && paper.keywords.length > 0 && (
            paper.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))
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
