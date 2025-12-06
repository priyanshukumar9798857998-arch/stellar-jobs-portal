// Mock data for jobs when no backend is available
import { Job } from '@/components/JobCard';

const JOBS_KEY = 'job_portal_jobs';
const APPLICATIONS_KEY = 'job_portal_applications';

const defaultJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $160k',
    description: 'We are looking for an experienced frontend developer to join our team. You will be responsible for building user interfaces using React and TypeScript.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'CSS/Tailwind expertise'],
    postedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['React', 'TypeScript', 'Remote'],
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'DataFlow Systems',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$130k - $170k',
    description: 'Join our backend team to build scalable APIs and microservices. Work with cutting-edge technologies and solve complex problems.',
    requirements: ['Node.js or Python', 'Database design', 'REST/GraphQL APIs'],
    postedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ['Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Creative Studio',
    location: 'Remote',
    type: 'Contract',
    salary: '$80k - $110k',
    description: 'Design beautiful and intuitive user experiences for our clients. Collaborate with developers and stakeholders to create amazing products.',
    requirements: ['Figma proficiency', 'User research experience', 'Portfolio required'],
    postedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    tags: ['Figma', 'UI/UX', 'Remote'],
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$140k - $180k',
    description: 'Build and maintain our cloud infrastructure. Implement CI/CD pipelines and ensure high availability of our services.',
    requirements: ['Kubernetes', 'AWS/GCP', 'Terraform'],
    postedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    tags: ['Kubernetes', 'AWS', 'CI/CD'],
  },
  {
    id: '5',
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'Boston, MA',
    type: 'Full-time',
    salary: '$110k - $150k',
    description: 'Lead product development from ideation to launch. Work closely with engineering, design, and marketing teams.',
    requirements: ['3+ years PM experience', 'Agile methodology', 'Technical background preferred'],
    postedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    tags: ['Product', 'Agile', 'Leadership'],
  },
];

const getStoredJobs = (): Job[] => {
  const stored = localStorage.getItem(JOBS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(JOBS_KEY, JSON.stringify(defaultJobs));
  return defaultJobs;
};

const saveJobs = (jobs: Job[]) => {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
};

interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeUrl: string;
  coverLetter?: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

const getStoredApplications = (): Application[] => {
  const stored = localStorage.getItem(APPLICATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveApplications = (applications: Application[]) => {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
};

export const mockJobsService = {
  getAll: async (params?: { page?: number; size?: number; search?: string }): Promise<{
    content: Job[];
    totalPages: number;
    totalElements: number;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let jobs = getStoredJobs();

    if (params?.search) {
      const search = params.search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(search) ||
          job.company.toLowerCase().includes(search) ||
          job.location.toLowerCase().includes(search)
      );
    }

    const page = params?.page || 1;
    const size = params?.size || 20;
    const start = (page - 1) * size;
    const paginatedJobs = jobs.slice(start, start + size);

    return {
      content: paginatedJobs,
      totalPages: Math.ceil(jobs.length / size),
      totalElements: jobs.length,
    };
  },

  getById: async (id: string): Promise<Job | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const jobs = getStoredJobs();
    return jobs.find((job) => job.id === id) || null;
  },

  create: async (data: Omit<Job, 'id' | 'postedAt'>): Promise<Job> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const jobs = getStoredJobs();
    const newJob: Job = {
      ...data,
      id: `job-${Date.now()}`,
      postedAt: new Date().toISOString(),
    };
    jobs.unshift(newJob);
    saveJobs(jobs);
    return newJob;
  },

  apply: async (jobId: string, data: { resumeUrl: string; coverLetter?: string; userId: string }): Promise<Application> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const applications = getStoredApplications();
    
    // Check if already applied
    const existing = applications.find(
      (app) => app.jobId === jobId && app.userId === data.userId
    );
    if (existing) {
      throw new Error('You have already applied to this job');
    }

    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobId,
      userId: data.userId,
      resumeUrl: data.resumeUrl,
      coverLetter: data.coverLetter,
      appliedAt: new Date().toISOString(),
      status: 'pending',
    };
    applications.push(newApplication);
    saveApplications(applications);
    return newApplication;
  },

  getApplicants: async (jobId: string): Promise<Application[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const applications = getStoredApplications();
    return applications.filter((app) => app.jobId === jobId);
  },
};

export const mockStorageService = {
  getPresignedUrl: async (filename: string): Promise<{ url: string; key: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Return a mock presigned URL - in reality this would be an S3/cloud storage URL
    const key = `uploads/${Date.now()}-${filename}`;
    return {
      url: `https://mock-storage.example.com/${key}`,
      key,
    };
  },

  uploadFile: async (file: File): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Simulate file upload - in a real app this would upload to cloud storage
    // For demo, we'll create a data URL (only works for small files)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Store in localStorage for demo (limited size)
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },
};
