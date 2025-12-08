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
  Edit3,
  ExternalLink,
  Clock,
  Calendar,
  TrendingUp,
  Sparkles,
  Link2,
} from 'lucide-react';
import Header from '@/components/Header';
import { Job } from '@/components/JobCard';
import { useToastContext } from '@/components/ToastContext';
import { mockJobsService } from '@/utils/mockData';
import { isAdmin } from '@/utils/auth';

interface Applicant {
  id: string;
  email: string;
  name: string;
  resumeUrl: string;
  coverLetter?: string;
  appliedAt: string;
}

// Expiration duration options
const EXPIRATION_OPTIONS = [
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '30 minutes', value: 30 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '6 hours', value: 6 * 60 * 60 * 1000 },
  { label: '12 hours', value: 12 * 60 * 60 * 1000 },
  { label: '1 day', value: 24 * 60 * 60 * 1000 },
  { label: '2 days', value: 2 * 24 * 60 * 60 * 1000 },
  { label: '3 days', value: 3 * 24 * 60 * 60 * 1000 },
  { label: '7 days', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '14 days', value: 14 * 24 * 60 * 60 * 1000 },
  { label: '30 days', value: 30 * 24 * 60 * 60 * 1000 },
];

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
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
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
    applyUrl: '',
    applicationSteps: '',
    expirationDuration: 7 * 24 * 60 * 60 * 1000, // Default 7 days
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch admin jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await mockJobsService.getAll({ page: 1, size: 100 });
        setJobs(response.content || []);
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

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      description: '',
      requirements: '',
      salary: '',
      type: 'FULL_TIME',
      applyUrl: '',
      applicationSteps: '',
      expirationDuration: 7 * 24 * 60 * 60 * 1000,
    });
    setFormErrors({});
    setEditingJob(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowJobForm(true);
  };

  const openEditForm = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: job.requirements.join('\n'),
      salary: job.salary || '',
      type: job.type.replace(/\s/g, '_').toUpperCase(),
      applyUrl: job.applyUrl || '',
      applicationSteps: job.applicationSteps?.join('\n') || '',
      expirationDuration: job.expiresAt
        ? new Date(job.expiresAt).getTime() - Date.now()
        : 7 * 24 * 60 * 60 * 1000,
    });
    setFormErrors({});
    setShowJobForm(true);
  };

  const closeForm = () => {
    setShowJobForm(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.company.trim()) errors.company = 'Company is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.applyUrl.trim()) errors.applyUrl = 'Apply URL is required';
    if (formData.applyUrl && !formData.applyUrl.startsWith('http')) {
      errors.applyUrl = 'Please enter a valid URL starting with http:// or https://';
    }

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

      const applicationSteps = formData.applicationSteps
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s);

      const expiresAt = new Date(Date.now() + formData.expirationDuration).toISOString();

      const jobData = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        requirements,
        salary: formData.salary.trim() || undefined,
        type: formData.type,
        tags: [],
        applyUrl: formData.applyUrl.trim(),
        applicationSteps: applicationSteps.length > 0 ? applicationSteps : undefined,
        expiresAt,
      };

      if (editingJob) {
        // Update existing job
        const updatedJob = await mockJobsService.update(editingJob.id, jobData);
        if (updatedJob) {
          setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? updatedJob : j)));
          addToast({
            type: 'success',
            title: 'Job updated!',
            message: 'The job posting has been updated.',
          });
        }
      } else {
        // Create new job
        const newJob = await mockJobsService.create(jobData);
        setJobs((prev) => [newJob, ...prev]);
        addToast({
          type: 'success',
          title: 'Job created!',
          message: 'The job posting is now live.',
        });
      }

      closeForm();
    } catch (err) {
      console.error('Failed to save job:', err);
      addToast({
        type: 'error',
        title: editingJob ? 'Failed to update job' : 'Failed to create job',
        message: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewApplicants = async (job: Job) => {
    setLoadingApplicants(true);

    try {
      const applicants = await mockJobsService.getApplicants(job.id);
      setSelectedJobApplicants({
        job,
        applicants: applicants.map((app) => ({
          id: app.id,
          email: app.userId,
          name: app.userId,
          resumeUrl: app.resumeUrl,
          coverLetter: app.coverLetter,
          appliedAt: app.appliedAt,
        })),
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
      await mockJobsService.delete(jobId);
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

  const formatTimeRemaining = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return 'Expired';

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
          {/* Premium Header */}
          <div className="relative mb-12 animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.1)] to-[hsl(var(--accent)/0.1)] rounded-3xl blur-3xl" />
            <div className="relative glass rounded-3xl p-8 border border-[hsl(var(--primary)/0.2)]">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-[hsl(var(--primary-foreground))]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-1">
                      Admin Dashboard
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                      Manage job postings and control expiration
                    </p>
                  </div>
                </div>
                <button onClick={openCreateForm} className="btn-primary flex items-center gap-2 group">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Create New Job
                </button>
              </div>
            </div>
          </div>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              {
                icon: Briefcase,
                value: jobs.length,
                label: 'Active Jobs',
                gradient: 'from-[hsl(var(--primary))] to-[hsl(var(--secondary))]',
              },
              {
                icon: Users,
                value: jobs.reduce((acc, j) => acc + (j.applicantCount || 0), 0),
                label: 'Total Applicants',
                gradient: 'from-[hsl(var(--secondary))] to-[hsl(var(--accent))]',
              },
              {
                icon: TrendingUp,
                value: jobs.filter((j) => {
                  const days = Math.floor((Date.now() - new Date(j.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  return days < 7;
                }).length,
                label: 'This Week',
                gradient: 'from-[hsl(var(--accent))] to-[hsl(var(--primary))]',
              },
              {
                icon: Clock,
                value: jobs.filter((j) => {
                  if (!j.expiresAt) return false;
                  const remaining = new Date(j.expiresAt).getTime() - Date.now();
                  return remaining > 0 && remaining < 24 * 60 * 60 * 1000;
                }).length,
                label: 'Expiring Soon',
                gradient: 'from-[hsl(var(--warning))] to-[hsl(var(--destructive))]',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                <div className="glass rounded-2xl p-6 h-full border border-transparent group-hover:border-[hsl(var(--primary)/0.3)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <stat.icon className="w-7 h-7 text-[hsl(var(--primary-foreground))]" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Jobs Table */}
          <div className="glass rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
            <div className="p-6 border-b border-[hsl(var(--border))] bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.05)] to-transparent">
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Job Postings</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage all your job listings</p>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-[hsl(var(--primary))]" />
                <p className="text-[hsl(var(--muted-foreground))] mt-4">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[hsl(var(--muted)/0.5)] flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-[hsl(var(--muted-foreground))] mb-4">No jobs posted yet</p>
                <button onClick={openCreateForm} className="btn-primary">
                  Create Your First Job
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[hsl(var(--muted)/0.3)]">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Job Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Apply Link
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Expiration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Applicants
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {jobs.map((job, index) => (
                      <tr
                        key={job.id}
                        className="hover:bg-[hsl(var(--muted)/0.2)] transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.2)] to-[hsl(var(--accent)/0.2)] flex items-center justify-center">
                              <Briefcase className="w-6 h-6 text-[hsl(var(--primary))]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[hsl(var(--foreground))]">{job.title}</p>
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">{job.company} • {job.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {job.applyUrl ? (
                            <a
                              href={job.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-medium hover:bg-[hsl(var(--primary)/0.2)] transition-colors"
                            >
                              <Link2 className="w-4 h-4" />
                              Visit Link
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">No link</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          {job.expiresAt ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                              <span
                                className={`text-sm font-medium ${
                                  new Date(job.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000
                                    ? 'text-[hsl(var(--warning))]'
                                    : 'text-[hsl(var(--muted-foreground))]'
                                }`}
                              >
                                {formatTimeRemaining(job.expiresAt)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">No expiry</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className="badge badge-primary">{job.type.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                            {job.applicantCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewApplicants(job)}
                              className="p-2.5 rounded-xl hover:bg-[hsl(var(--muted))] transition-all duration-200 group"
                              aria-label="View applicants"
                              title="View Applicants"
                            >
                              <Eye className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
                            </button>
                            <button
                              onClick={() => openEditForm(job)}
                              className="p-2.5 rounded-xl hover:bg-[hsl(var(--primary)/0.1)] transition-all duration-200 group"
                              aria-label="Edit job"
                              title="Edit Job"
                            >
                              <Edit3 className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-2.5 rounded-xl hover:bg-[hsl(var(--destructive)/0.1)] transition-all duration-200 group"
                              aria-label="Delete job"
                              title="Delete Job"
                            >
                              <Trash2 className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--destructive))]" />
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

      {/* Create/Edit Job Modal */}
      {showJobForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeForm()}>
          <div className="modal-content max-w-3xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                  {editingJob ? <Edit3 className="w-6 h-6 text-[hsl(var(--primary-foreground))]" /> : <Plus className="w-6 h-6 text-[hsl(var(--primary-foreground))]" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {editingJob ? 'Edit Job' : 'Create New Job'}
                  </h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {editingJob ? 'Update job details and expiration' : 'Fill in the details for your new job posting'}
                  </p>
                </div>
              </div>
              <button onClick={closeForm} className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="title" className="form-label">Job Title *</label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className={`input-glass ${formErrors.title ? 'input-error' : ''}`}
                    placeholder="e.g., Senior React Developer"
                  />
                  {formErrors.title && <p className="form-error">{formErrors.title}</p>}
                </div>
                <div>
                  <label htmlFor="company" className="form-label">Company *</label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                    className={`input-glass ${formErrors.company ? 'input-error' : ''}`}
                    placeholder="e.g., Tech Corp"
                  />
                  {formErrors.company && <p className="form-error">{formErrors.company}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="location" className="form-label">Location *</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className={`input-glass ${formErrors.location ? 'input-error' : ''}`}
                    placeholder="e.g., San Francisco, CA"
                  />
                  {formErrors.location && <p className="form-error">{formErrors.location}</p>}
                </div>
                <div>
                  <label htmlFor="salary" className="form-label">Salary Range</label>
                  <input
                    type="text"
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => setFormData((prev) => ({ ...prev, salary: e.target.value }))}
                    className="input-glass"
                    placeholder="e.g., $100k - $150k"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="type" className="form-label">Job Type</label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
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
                  <label htmlFor="expiration" className="form-label flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Auto-Delete After *
                  </label>
                  <select
                    id="expiration"
                    value={formData.expirationDuration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expirationDuration: Number(e.target.value) }))}
                    className="input-glass cursor-pointer"
                  >
                    {EXPIRATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Apply URL - Important */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--primary)/0.1)] to-[hsl(var(--accent)/0.1)] border border-[hsl(var(--primary)/0.2)]">
                <label htmlFor="applyUrl" className="form-label flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[hsl(var(--primary))]" />
                  External Apply URL *
                </label>
                <input
                  type="url"
                  id="applyUrl"
                  value={formData.applyUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, applyUrl: e.target.value }))}
                  className={`input-glass ${formErrors.applyUrl ? 'input-error' : ''}`}
                  placeholder="https://example.com/apply/job-id"
                />
                {formErrors.applyUrl && <p className="form-error">{formErrors.applyUrl}</p>}
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                  Users will be redirected to this URL when they click "Apply Now"
                </p>
              </div>

              <div>
                <label htmlFor="description" className="form-label">Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className={`input-glass resize-none ${formErrors.description ? 'input-error' : ''}`}
                  rows={4}
                  placeholder="Describe the role and responsibilities..."
                />
                {formErrors.description && <p className="form-error">{formErrors.description}</p>}
              </div>

              <div>
                <label htmlFor="requirements" className="form-label">Requirements (one per line)</label>
                <textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requirements: e.target.value }))}
                  className="input-glass resize-none"
                  rows={4}
                  placeholder="5+ years React experience&#10;TypeScript proficiency&#10;Strong communication skills"
                />
              </div>

              <div>
                <label htmlFor="applicationSteps" className="form-label">Application Steps (one per line)</label>
                <textarea
                  id="applicationSteps"
                  value={formData.applicationSteps}
                  onChange={(e) => setFormData((prev) => ({ ...prev, applicationSteps: e.target.value }))}
                  className="input-glass resize-none"
                  rows={3}
                  placeholder="Click Apply Now button&#10;Fill out the application form&#10;Upload your resume"
                />
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button type="button" onClick={closeForm} className="btn-secondary" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {editingJob ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingJob ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </>
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
          onClick={(e) => e.target === e.currentTarget && setSelectedJobApplicants(null)}
        >
          <div className="modal-content max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--primary))] flex items-center justify-center">
                  <Users className="w-6 h-6 text-[hsl(var(--primary-foreground))]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Applicants</h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{selectedJobApplicants.job.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJobApplicants(null)}
                className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingApplicants ? (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-[hsl(var(--primary))]" />
              </div>
            ) : selectedJobApplicants.applicants.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[hsl(var(--muted)/0.5)] flex items-center justify-center">
                  <Users className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-[hsl(var(--muted-foreground))]">No applicants yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedJobApplicants.applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="p-5 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-[hsl(var(--foreground))]">{applicant.name}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{applicant.email}</p>
                      </div>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(applicant.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {applicant.coverLetter && (
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 line-clamp-2">{applicant.coverLetter}</p>
                    )}
                    <a
                      href={applicant.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--secondary))] transition-colors"
                    >
                      View Resume
                      <ExternalLink className="w-4 h-4" />
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
