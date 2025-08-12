import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Filters = {
  query: string;
  status: "all" | "published" | "in-review" | "draft";
  collaborator: string;
};

export const SearchAndFilters = ({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          placeholder="Search papers, authors, keywords..."
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          aria-label="Search papers"
          className="pl-4"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Status</Label>
          <Select value={value.status} onValueChange={(v) => onChange({ ...value, status: v as Filters["status"] })}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Collaborator</Label>
          <Input
            placeholder="Filter by collaborator name"
            value={value.collaborator}
            onChange={(e) => onChange({ ...value, collaborator: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
