import React from 'react';
import { X, ExternalLink, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { Job } from './JobCard';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  job,
}) => {
  if (!isOpen) return null;

  const handleApplyClick = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-[hsl(var(--card))] pb-4 border-b border-[hsl(var(--border))]">
          <h2
            id="apply-modal-title"
            className="text-xl font-bold text-[hsl(var(--foreground))]"
          >
            {job.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors focus-ring"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Job Info Header */}
        <div className="mb-6 p-4 rounded-lg bg-[hsl(var(--muted)/0.5)]">
          <p className="text-[hsl(var(--muted-foreground))] mb-1">{job.company}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{job.location}</p>
          {job.salary && (
            <p className="text-sm text-[hsl(var(--primary))] font-medium mt-2">{job.salary}</p>
          )}
        </div>

        {/* Requirements Section */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              <FileText className="w-5 h-5 text-[hsl(var(--primary))]" />
              Requirements & Qualifications
            </h3>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3 text-[hsl(var(--muted-foreground))]">
                  <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Application Steps Section */}
        {job.applicationSteps && job.applicationSteps.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              <AlertCircle className="w-5 h-5 text-[hsl(var(--warning))]" />
              How to Apply
            </h3>
            <ol className="space-y-3">
              {job.applicationSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-[hsl(var(--muted-foreground))]">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">
            Job Description
          </h3>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-6 p-4 rounded-lg bg-[hsl(var(--warning)/0.1)] border border-[hsl(var(--warning)/0.3)]">
          <p className="text-sm text-[hsl(var(--warning))]">
            <strong>Note:</strong> Clicking the button below will redirect you to the official application page. Please read all requirements carefully before applying.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-[hsl(var(--border))]">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary focus-ring"
          >
            Close
          </button>
          {job.applyUrl ? (
            <button
              onClick={handleApplyClick}
              className="btn-primary focus-ring flex items-center gap-2"
            >
              Apply on Official Website
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))] italic py-2">
              Application link not available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
