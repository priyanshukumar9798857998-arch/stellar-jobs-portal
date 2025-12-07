import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Briefcase } from 'lucide-react';
import Header from '@/components/Header';
import JobCard, { Job } from '@/components/JobCard';
import ApplyModal from '@/components/ApplyModal';
import { useToastContext } from '@/components/ToastContext';
import { mockJobsService } from '@/utils/mockData';
import { getBookmarks, removeBookmark } from '@/utils/bookmarks';

const Bookmarks: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const navigate = useNavigate();
  const { addToast } = useToastContext();

  const fetchBookmarkedJobs = useCallback(async () => {
    setIsLoading(true);
    const ids = getBookmarks();
    setBookmarkedIds(ids);

    try {
      const response = await mockJobsService.getAll({ page: 1, size: 100 });
      const allJobs = response.content || [];
      const bookmarkedJobs = allJobs.filter((job) => ids.includes(job.id));
      setJobs(bookmarkedJobs);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarkedJobs();
  }, [fetchBookmarkedJobs]);

  const handleRemoveBookmark = (jobId: string) => {
    removeBookmark(jobId);
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    setBookmarkedIds((prev) => prev.filter((id) => id !== jobId));
    addToast({
      type: 'info',
      title: 'Bookmark removed',
    });
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleViewJob = (job: Job) => {
    navigate(`/jobs/${job.id}`);
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
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.2)] flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                Saved Jobs
              </h1>
            </div>
            <p className="text-[hsl(var(--muted-foreground))]">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} saved for later
            </p>
          </div>

          {/* Job List */}
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-glass">
                  <div className="flex gap-4">
                    <div className="skeleton w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="skeleton h-6 w-3/4" />
                      <div className="skeleton h-4 w-1/2" />
                      <div className="skeleton h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card-glass text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
              <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--foreground))]">
                No Saved Jobs
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                Bookmark jobs you're interested in to save them for later
              </p>
              <button
                onClick={() => navigate('/jobs')}
                className="btn-primary"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job, index) => (
                <div key={job.id} className="stagger-item relative">
                  <JobCard
                    job={job}
                    onApply={() => handleApply(job)}
                    onView={() => handleViewJob(job)}
                    isBookmarked={true}
                    onToggleBookmark={() => handleRemoveBookmark(job.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
        />
      )}
    </div>
  );
};

export default Bookmarks;
