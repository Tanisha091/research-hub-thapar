import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoAuthors } from "@/hooks/useCoAuthors";
import type { EnhancedFilters } from "@/components/research/EnhancedSearchAndFilters";

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

interface FilterDrawerProps {
  value: EnhancedFilters;
  onChange: (f: EnhancedFilters) => void;
}

export const FilterDrawer = ({ value, onChange }: FilterDrawerProps) => {
  const { coAuthors, loading } = useCoAuthors();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open filters">
          <Filter className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Papers</SheetTitle>
          <SheetDescription>
            Apply filters to refine your search results
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
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
                <SelectItem value="all">All Co-Authors</SelectItem>
                {!loading && coAuthors.map(coAuthor => (
                  <SelectItem key={coAuthor.id} value={coAuthor.id}>
                    {coAuthor.full_name} ({coAuthor.department.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Additional Collaborator</Label>
            <Input
              placeholder="External collaborator name"
              value={value.collaborator}
              onChange={(e) => onChange({ ...value, collaborator: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Upload Date Range</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input
                type="date"
                placeholder="From"
                value={value.uploadDateFrom}
                onChange={(e) => onChange({ ...value, uploadDateFrom: e.target.value })}
              />
              <Input
                type="date"
                placeholder="To"
                value={value.uploadDateTo}
                onChange={(e) => onChange({ ...value, uploadDateTo: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Publish Date Range</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input
                type="date"
                placeholder="From"
                value={value.publishDateFrom}
                onChange={(e) => onChange({ ...value, publishDateFrom: e.target.value })}
              />
              <Input
                type="date"
                placeholder="To"
                value={value.publishDateTo}
                onChange={(e) => onChange({ ...value, publishDateTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};