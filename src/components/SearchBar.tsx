import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: FilterState) => void;
  placeholder?: string;
}

export interface FilterState {
  type: string;
  location: string;
  salary: string;
}

const JOB_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'REMOTE', label: 'Remote' },
];

const SALARY_RANGES = [
  { value: '', label: 'Any Salary' },
  { value: '0-50000', label: '$0 - $50k' },
  { value: '50000-100000', label: '$50k - $100k' },
  { value: '100000-150000', label: '$100k - $150k' },
  { value: '150000+', label: '$150k+' },
];

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = 'Search jobs by title, company, or keyword...',
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    location: '',
    salary: '',
  });

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { type: '', location: '', salary: '' };
    setFilters(emptyFilters);
    onFilterChange?.(emptyFilters);
  };

  const hasActiveFilters = filters.type || filters.location || filters.salary;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="input-glass w-full pl-12 pr-10"
            aria-label="Search jobs"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 focus-ring ${
            hasActiveFilters ? 'ring-2 ring-[hsl(var(--primary))]' : ''
          }`}
          aria-expanded={showFilters}
          aria-label="Toggle filters"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]" />
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card-glass animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Job Type */}
            <div>
              <label
                htmlFor="filter-type"
                className="form-label text-sm"
              >
                Job Type
              </label>
              <select
                id="filter-type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input-glass cursor-pointer"
              >
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="filter-location"
                className="form-label text-sm"
              >
                Location
              </label>
              <input
                type="text"
                id="filter-location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="e.g., San Francisco"
                className="input-glass"
              />
            </div>

            {/* Salary Range */}
            <div>
              <label
                htmlFor="filter-salary"
                className="form-label text-sm"
              >
                Salary Range
              </label>
              <select
                id="filter-salary"
                value={filters.salary}
                onChange={(e) => handleFilterChange('salary', e.target.value)}
                className="input-glass cursor-pointer"
              >
                {SALARY_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
