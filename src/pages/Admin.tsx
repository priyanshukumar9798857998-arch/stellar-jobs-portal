import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  Users,
  Loader2,
  X,
  Eye,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import Header from '@/components/Header';
import { Job } from '@/components/JobCard';
import { useToastContext } from '@/components/ToastContext';
import { jobsAPI } from '@/utils/api';
import { isAdmin } from '@/utils/auth';

interface Applicant {
  id: string;
  email: string;
  name: string;
  resumeUrl: string;
  coverLetter?: string;
  appliedAt: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToastContext();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/jobs');
    }
  }, [navigate]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState<{
    job: Job;
    applicants: Applicant[];
  } | null>(null);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    type: 'FULL_TIME',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch admin jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobsAPI.getAll({ page: 1, size: 100 });
        setJobs(response.data.content || response.data || []);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        addToast({
          type: 'error',
          title: 'Failed to load jobs',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [addToast]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.company.trim()) errors.company = 'Company is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.description.trim()) errors.description = 'Description is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const requirements = formData.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter((r) => r);

      const response = await jobsAPI.create({
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        requirements,
        salary: formData.salary.trim() || undefined,
        type: formData.type,
      });

      setJobs((prev) => [response.data, ...prev]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: '',
        salary: '',
        type: 'FULL_TIME',
      });

      addToast({
        type: 'success',
        title: 'Job created!',
        message: 'The job posting is now live.',
      });
    } catch (err) {
      console.error('Failed to create job:', err);
      addToast({
        type: 'error',
        title: 'Failed to create job',
        message: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewApplicants = async (job: Job) => {
    setLoadingApplicants(true);

    try {
      const response = await jobsAPI.getApplicants(job.id);
      setSelectedJobApplicants({
        job,
        applicants: response.data || [],
      });
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
      addToast({
        type: 'error',
        title: 'Failed to load applicants',
      });
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      await jobsAPI.delete(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      addToast({
        type: 'success',
        title: 'Job deleted',
      });
    } catch (err) {
      console.error('Failed to delete job:', err);
      addToast({
        type: 'error',
        title: 'Failed to delete job',
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="space-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Header />

      <main className="page-container">
        <div className="container-wide">
          {/* Page Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                Admin Dashboard
              </h1>
              <p className="text-[hsl(var(--muted-foreground))]">
                Manage job postings and view applicants
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Job
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card-glass">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.2)] flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {jobs.length}
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Active Jobs
                  </p>
                </div>
              </div>
            </div>
            <div className="card-glass">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--secondary)/0.2)] flex items-center justify-center">
                  <Users className="w-6 h-6 text-[hsl(var(--secondary))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {jobs.reduce((acc, j) => acc + (j.applicantCount || 0), 0)}
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Total Applicants
                  </p>
                </div>
              </div>
            </div>
            <div className="card-glass">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent)/0.2)] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-[hsl(var(--accent))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {jobs.filter((j) => {
                      const days = Math.floor(
                        (Date.now() - new Date(j.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return days < 7;
                    }).length}
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    This Week
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="card-glass overflow-hidden">
            <div className="p-4 border-b border-[hsl(var(--border))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Job Postings
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  No jobs posted yet. Create your first job posting!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[hsl(var(--muted)/0.5)]">
                      <th className="px-4 py-3 text-left text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Job Title
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Applicants
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-[hsl(var(--foreground))]">
                              {job.title}
                            </p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              {job.company}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="badge badge-primary">
                            {job.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                          {job.location}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                            {job.applicantCount || 0}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewApplicants(job)}
                              className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                              aria-label="View applicants"
                            >
                              <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-2 rounded-lg hover:bg-[hsl(var(--destructive)/0.1)] transition-colors"
                              aria-label="Delete job"
                            >
                              <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Job Modal */}
      {showCreateForm && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowCreateForm(false)}
        >
          <div className="modal-content max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                Create New Job
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="form-label">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className={`input-glass ${formErrors.title ? 'input-error' : ''}`}
                    placeholder="e.g., Senior React Developer"
                  />
                  {formErrors.title && (
                    <p className="form-error">{formErrors.title}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="company" className="form-label">
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, company: e.target.value }))
                    }
                    className={`input-glass ${formErrors.company ? 'input-error' : ''}`}
                    placeholder="e.g., Tech Corp"
                  />
                  {formErrors.company && (
                    <p className="form-error">{formErrors.company}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="form-label">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className={`input-glass ${formErrors.location ? 'input-error' : ''}`}
                    placeholder="e.g., San Francisco, CA"
                  />
                  {formErrors.location && (
                    <p className="form-error">{formErrors.location}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="salary" className="form-label">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    id="salary"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, salary: e.target.value }))
                    }
                    className="input-glass"
                    placeholder="e.g., $100k - $150k"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="form-label">
                  Job Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="input-glass cursor-pointer"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className={`input-glass resize-none ${
                    formErrors.description ? 'input-error' : ''
                  }`}
                  rows={4}
                  placeholder="Describe the role and responsibilities..."
                />
                {formErrors.description && (
                  <p className="form-error">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label htmlFor="requirements" className="form-label">
                  Requirements (one per line)
                </label>
                <textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirements: e.target.value,
                    }))
                  }
                  className="input-glass resize-none"
                  rows={4}
                  placeholder="5+ years React experience&#10;TypeScript proficiency&#10;Strong communication skills"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Job'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
      {selectedJobApplicants && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setSelectedJobApplicants(null)
          }
        >
          <div className="modal-content max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                  Applicants
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {selectedJobApplicants.job.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedJobApplicants(null)}
                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingApplicants ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
              </div>
            ) : selectedJobApplicants.applicants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  No applicants yet
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedJobApplicants.applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="p-4 rounded-lg bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))]">
                          {applicant.name}
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {applicant.email}
                        </p>
                      </div>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(applicant.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {applicant.coverLetter && (
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3 line-clamp-2">
                        {applicant.coverLetter}
                      </p>
                    )}
                    <a
                      href={applicant.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm link"
                    >
                      View Resume →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
