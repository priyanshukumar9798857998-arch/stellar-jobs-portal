import React from 'react';
import { MapPin, Building2, DollarSign, Clock, Briefcase } from 'lucide-react';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: string;
  createdAt: string;
  applicantCount?: number;
}

interface JobCardProps {
  job: Job;
  onApply?: () => void;
  onView?: () => void;
  showApplyButton?: boolean;
  isNew?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
  onView,
  showApplyButton = true,
  isNew = false,
}) => {
  const typeColors: Record<string, string> = {
    'FULL_TIME': 'badge-primary',
    'PART_TIME': 'badge-secondary',
    'CONTRACT': 'badge-accent',
    'INTERNSHIP': 'badge-success',
    'REMOTE': 'badge-primary',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <article
      className={`card-glass-hover relative ${isNew ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`}
      tabIndex={0}
      role="article"
      aria-label={`Job: ${job.title} at ${job.company}`}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 px-2 py-1 text-xs font-bold rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
          NEW
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Company Logo Placeholder */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-[hsl(var(--primary))]" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] line-clamp-1">
                {job.title}
              </h3>
              <p className="text-[hsl(var(--muted-foreground))]">{job.company}</p>
            </div>
            <span className={`badge ${typeColors[job.type] || 'badge'}`}>
              {job.type.replace('_', ' ')}
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--muted-foreground))] mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salary}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(job.createdAt)}
            </span>
            {job.applicantCount !== undefined && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.applicantCount} applicants
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-4">
            {job.description}
          </p>

          {/* Requirements Tags */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.requirements.slice(0, 4).map((req, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                >
                  {req}
                </span>
              ))}
              {job.requirements.length > 4 && (
                <span className="px-2 py-1 text-xs rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                  +{job.requirements.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {onView && (
              <button
                onClick={onView}
                className="btn-secondary text-sm focus-ring"
              >
                View Details
              </button>
            )}
            {showApplyButton && onApply && (
              <button
                onClick={onApply}
                className="btn-primary text-sm focus-ring"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default JobCard;
