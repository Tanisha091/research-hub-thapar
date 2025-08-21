import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoAuthors } from "@/hooks/useCoAuthors";

export type EnhancedFilters = {
  query: string;
  status: "all" | "published" | "in-review" | "draft";
  collaborator: string;
  department: "all" | "csed" | "eced" | "mced" | "eid" | "med" | "btd" | "ees" | "ced";
  coAuthor: string;
  uploadDateFrom: string;
  uploadDateTo: string;
  publishDateFrom: string;
  publishDateTo: string;
};

const DEPARTMENTS = [
  { value: 'all', label: 'All Departments' },
  { value: 'csed', label: 'Computer Science & Engineering' },
  { value: 'eced', label: 'Electronics & Communication Engineering' },
  { value: 'mced', label: 'Mechanical Engineering' },
  { value: 'eid', label: 'Electrical & Instrumentation Engineering' },
  { value: 'med', label: 'Metallurgical Engineering' },
  { value: 'btd', label: 'Biotechnology' },
  { value: 'ees', label: 'Energy & Environmental Sciences' },
  { value: 'ced', label: 'Civil Engineering' },
];

export const EnhancedSearchAndFilters = ({ value, onChange }: { value: EnhancedFilters; onChange: (f: EnhancedFilters) => void }) => {
  const { coAuthors, loading } = useCoAuthors();

  return (
    <div className="space-y-4">
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
          <Select value={value.status} onValueChange={(v) => onChange({ ...value, status: v as EnhancedFilters["status"] })}>
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
        
        <div>
          <Label>Department</Label>
          <Select value={value.department} onValueChange={(v) => onChange({ ...value, department: v as EnhancedFilters["department"] })}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(dept => (
                <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Co-Author</Label>
          <Select value={value.coAuthor} onValueChange={(v) => onChange({ ...value, coAuthor: v })}>
            <SelectTrigger>
              <SelectValue placeholder="All Co-Authors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Co-Authors</SelectItem>
              {!loading && coAuthors.map(coAuthor => (
                <SelectItem key={coAuthor.id} value={coAuthor.id}>
                  {coAuthor.full_name} ({coAuthor.department.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Additional Collaborator</Label>
          <Input
            placeholder="Filter by external collaborator name"
            value={value.collaborator}
            onChange={(e) => onChange({ ...value, collaborator: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Upload Date Range</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <Input
                type="date"
                placeholder="From"
                value={value.uploadDateFrom}
                onChange={(e) => onChange({ ...value, uploadDateFrom: e.target.value })}
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="To"
                value={value.uploadDateTo}
                onChange={(e) => onChange({ ...value, uploadDateTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Publish Date Range</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <Input
                type="date"
                placeholder="From"
                value={value.publishDateFrom}
                onChange={(e) => onChange({ ...value, publishDateFrom: e.target.value })}
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="To"
                value={value.publishDateTo}
                onChange={(e) => onChange({ ...value, publishDateTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};