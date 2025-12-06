import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Briefcase, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import Header from '@/components/Header';
import JobCard, { Job } from '@/components/JobCard';
import SearchBar, { FilterState } from '@/components/SearchBar';
import ApplyModal from '@/components/ApplyModal';
import { useToastContext } from '@/components/ToastContext';
import { mockJobsService } from '@/utils/mockData';
import { getBookmarks, toggleBookmark } from '@/utils/bookmarks';
import socketService from '@/utils/socket';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ type: '', location: '', salary: '' });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [newJobIds, setNewJobIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const { addToast } = useToastContext();

  // Fetch jobs from API
  const fetchJobs = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (pageNum === 1) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await mockJobsService.getAll({
        page: pageNum,
        size: 20,
        search: searchQuery || undefined,
      });

      const newJobs = response.content || [];
      const totalPages = response.totalPages || 1;

      if (pageNum === 1) {
        setJobs(newJobs);
      } else {
        setJobs((prev) => [...prev, ...newJobs]);
      }

      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery]);

  // Initial fetch and load bookmarks
  useEffect(() => {
    fetchJobs(1);
    setBookmarkedIds(new Set(getBookmarks()));
  }, [fetchJobs]);

  // WebSocket connection
  useEffect(() => {
    const connectSocket = async () => {
      try {
        await socketService.connect();
        setIsSocketConnected(true);

        // Subscribe to job updates
        const unsubscribe = socketService.subscribe('/topic/jobs', (message) => {
          const newJob = message as Job;
          
          setJobs((prev) => {
            // Check if job already exists
            if (prev.some((j) => j.id === newJob.id)) {
              return prev.map((j) => (j.id === newJob.id ? newJob : j));
            }
            return [newJob, ...prev];
          });

          // Mark as new and show toast
          setNewJobIds((prev) => new Set([...prev, newJob.id]));
          
          addToast({
            type: 'info',
            title: 'New Job Posted!',
            message: newJob.title,
            action: {
              label: 'View',
              onClick: () => navigate(`/jobs/${newJob.id}`),
            },
          });

          // Remove "new" badge after 10 seconds
          setTimeout(() => {
            setNewJobIds((prev) => {
              const updated = new Set(prev);
              updated.delete(newJob.id);
              return updated;
            });
          }, 10000);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Socket connection failed:', err);
        setIsSocketConnected(false);
      }
    };

    const cleanup = connectSocket();

    return () => {
      cleanup?.then((unsubscribe) => unsubscribe?.());
    };
  }, [addToast, navigate]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    // In a real app, you'd include filters in the API call
  }, []);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleViewJob = (job: Job) => {
    navigate(`/jobs/${job.id}`);
  };

  const handleToggleBookmark = (jobId: string) => {
    const result = toggleBookmark(jobId);
    setBookmarkedIds(new Set(result.bookmarks));
    addToast({
      type: 'info',
      title: result.isBookmarked ? 'Job saved' : 'Bookmark removed',
    });
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchJobs(page + 1);
    }
  };

  // Filter jobs client-side for demo (in real app, this would be server-side)
  const filteredJobs = jobs.filter((job) => {
    if (filters.type && job.type !== filters.type) return false;
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

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
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                  Find Your Next Opportunity
                </h1>
                <p className="text-[hsl(var(--muted-foreground))]">
                  {filteredJobs.length} jobs available
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Socket Connection Status */}
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    isSocketConnected
                      ? 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                  }`}
                  aria-label={isSocketConnected ? 'Live updates active' : 'Live updates disconnected'}
                >
                  {isSocketConnected ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span className="hidden sm:inline">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span className="hidden sm:inline">Offline</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => fetchJobs(1, true)}
                  disabled={isRefreshing}
                  className="btn-secondary flex items-center gap-2"
                  aria-label="Refresh jobs"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Job List */}
          {isLoading && page === 1 ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card-glass">
                  <div className="flex gap-4">
                    <div className="skeleton w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="skeleton h-6 w-3/4" />
                      <div className="skeleton h-4 w-1/2" />
                      <div className="skeleton h-4 w-full" />
                      <div className="flex gap-2">
                        <div className="skeleton h-6 w-20" />
                        <div className="skeleton h-6 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="card-glass text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
              <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--foreground))]">
                Unable to Load Jobs
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] mb-4">{error}</p>
              <button onClick={() => fetchJobs(1)} className="btn-primary">
                Try Again
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="card-glass text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
              <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--foreground))]">
                No Jobs Found
              </h2>
              <p className="text-[hsl(var(--muted-foreground))]">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="stagger-item">
                    <JobCard
                      job={job}
                      onApply={() => handleApply(job)}
                      onView={() => handleViewJob(job)}
                      isNew={newJobIds.has(job.id)}
                      isBookmarked={bookmarkedIds.has(job.id)}
                      onToggleBookmark={() => handleToggleBookmark(job.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="btn-secondary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More Jobs'
                    )}
                  </button>
                </div>
              )}
            </>
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
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
        />
      )}
    </div>
  );
};

export default Jobs;
