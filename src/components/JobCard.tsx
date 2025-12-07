import React, { useState, useEffect } from 'react';
import { MapPin, Building2, DollarSign, Clock, Briefcase, Bookmark, Timer, ExternalLink } from 'lucide-react';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: string;
  createdAt?: string;
  postedAt?: string;
  applicantCount?: number;
  tags?: string[];
  expiresAt?: string;
  applyUrl?: string;
  applicationSteps?: string[];
}

interface JobCardProps {
  job: Job;
  onApply?: () => void;
  onView?: () => void;
  showApplyButton?: boolean;
  isNew?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
  onView,
  showApplyButton = true,
  isNew = false,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  const typeColors: Record<string, string> = {
    'FULL_TIME': 'badge-primary',
    'PART_TIME': 'badge-secondary',
    'CONTRACT': 'badge-accent',
    'INTERNSHIP': 'badge-success',
    'REMOTE': 'badge-primary',
  };

  useEffect(() => {
    if (!job.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(job.expiresAt!).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m left`);
      } else {
        setTimeRemaining(`${minutes}m left`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [job.expiresAt]);

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

  const handleApplyClick = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    } else if (onApply) {
      onApply();
    }
  };

  if (isExpired) return null; // Don't render expired jobs

  return (
    <article
      className={`card-glass-hover relative ${isNew ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`}
      tabIndex={0}
      role="article"
      aria-label={`Job: ${job.title} at ${job.company}`}
    >
      {/* Bookmark Button */}
      {onToggleBookmark && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors focus-ring ${
            isBookmarked
              ? 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]'
              : 'hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
          }`}
          aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
          <Bookmark
            className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`}
          />
        </button>
      )}

      {isNew && (
        <div className="absolute -top-2 -left-2 px-2 py-1 text-xs font-bold rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
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
              {formatDate(job.createdAt || job.postedAt || new Date().toISOString())}
            </span>
            {job.applicantCount !== undefined && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.applicantCount} applicants
              </span>
            )}
          </div>

          {/* Expiration Timer */}
          {job.expiresAt && timeRemaining && (
            <div className={`flex items-center gap-2 text-sm mb-3 ${
              timeRemaining.includes('h') && !timeRemaining.includes('d')
                ? 'text-[hsl(var(--destructive))]'
                : 'text-[hsl(var(--warning))]'
            }`}>
              <Timer className="w-4 h-4" />
              <span className="font-medium">{timeRemaining}</span>
            </div>
          )}

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
            {showApplyButton && (
              <button
                onClick={handleApplyClick}
                className="btn-primary text-sm focus-ring flex items-center gap-2"
              >
                Apply Now
                {job.applyUrl && <ExternalLink className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default JobCard;