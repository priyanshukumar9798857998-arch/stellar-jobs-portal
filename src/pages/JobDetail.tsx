import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Briefcase,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Header from '@/components/Header';
import ApplyModal from '@/components/ApplyModal';
import { Job } from '@/components/JobCard';
import { jobsAPI } from '@/utils/api';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await jobsAPI.getById(id);
        setJob(response.data);
      } catch (err) {
        console.error('Failed to fetch job:', err);
        setError('Failed to load job details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const typeColors: Record<string, string> = {
    'FULL_TIME': 'badge-primary',
    'PART_TIME': 'badge-secondary',
    'CONTRACT': 'badge-accent',
    'INTERNSHIP': 'badge-success',
    'REMOTE': 'badge-primary',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="space-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <Header />
        <main className="page-container">
          <div className="container-narrow">
            <div className="card-glass animate-pulse">
              <div className="skeleton h-8 w-3/4 mb-4" />
              <div className="skeleton h-5 w-1/2 mb-6" />
              <div className="flex gap-4 mb-6">
                <div className="skeleton h-5 w-24" />
                <div className="skeleton h-5 w-24" />
                <div className="skeleton h-5 w-24" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen">
        <div className="space-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <Header />
        <main className="page-container">
          <div className="container-narrow">
            <div className="card-glass text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
              <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--foreground))]">
                Job Not Found
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                {error || 'This job posting may have been removed.'}
              </p>
              <button onClick={() => navigate('/jobs')} className="btn-primary">
                Browse All Jobs
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Header />

      <main className="page-container">
        <div className="container-narrow">
          {/* Back Button */}
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <article className="card-glass animate-fade-in">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                        {job.title}
                      </h1>
                      <span className={`badge ${typeColors[job.type] || 'badge'}`}>
                        {job.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-lg text-[hsl(var(--muted-foreground))]">
                      {job.company}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--muted-foreground))] mb-6 pb-6 border-b border-[hsl(var(--border))]">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Posted {formatDate(job.createdAt)}
                  </span>
                  {job.applicantCount !== undefined && (
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {job.applicantCount} applicants
                    </span>
                  )}
                </div>

                {/* Description */}
                <section className="mb-6">
                  <h2 className="text-lg font-semibold mb-3 text-[hsl(var(--foreground))]">
                    Job Description
                  </h2>
                  <div className="prose prose-invert max-w-none text-[hsl(var(--muted-foreground))] leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </div>
                </section>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-3 text-[hsl(var(--foreground))]">
                      Requirements
                    </h2>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-[hsl(var(--muted-foreground))]"
                        >
                          <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </article>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <div className="card-glass sticky top-24 animate-slide-up">
                <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">
                  Apply for this Job
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
                  Submit your application and resume to be considered for this
                  position.
                </p>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="btn-primary w-full"
                >
                  Apply Now
                </button>
              </div>

              {/* Company Info */}
              <div className="card-glass">
                <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">
                  About {job.company}
                </h3>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Learn more about this company and discover other open positions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        jobId={job.id}
        jobTitle={job.title}
      />
    </div>
  );
};

export default JobDetail;
