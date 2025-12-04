import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Users,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const Index: React.FC = () => {
  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Smart Search',
      description: 'Find jobs that match your skills with our intelligent search and filtering system.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Updates',
      description: 'Get instant notifications when new jobs matching your interests are posted.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Applications',
      description: 'Your data is encrypted and protected. Apply with confidence.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Top Companies',
      description: 'Connect with leading companies across various industries.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Jobs' },
    { value: '5K+', label: 'Companies' },
    { value: '100K+', label: 'Job Seekers' },
    { value: '50K+', label: 'Successful Hires' },
  ];

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="space-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-xl text-gradient"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
              </div>
              <span>JobPortal</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                Sign In
              </Link>
              <Link to="/login" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-[hsl(var(--foreground))]">
              Find Your{' '}
              <span className="text-gradient">Dream Career</span>{' '}
              Today
            </h1>
            <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
              Connect with top companies and discover opportunities that match
              your skills, experience, and career aspirations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                Browse Jobs
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Post a Job
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="card-glass p-6 sm:p-8 max-w-4xl mx-auto animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      className="input-glass pl-12 w-full"
                      readOnly
                    />
                  </div>
                </div>
                <Link to="/login" className="btn-primary px-8">
                  Search Jobs
                </Link>
              </div>

              {/* Popular Searches */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  Popular:
                </span>
                {['React Developer', 'Product Manager', 'Data Scientist', 'UX Designer'].map(
                  (term) => (
                    <span
                      key={term}
                      className="badge cursor-pointer hover:bg-[hsl(var(--primary)/0.2)] transition-colors"
                    >
                      {term}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="card-glass text-center stagger-item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[hsl(var(--foreground))]">
              Why Choose JobPortal?
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              We make job searching easy, efficient, and secure.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-glass-hover text-center stagger-item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] flex items-center justify-center text-[hsl(var(--primary))]">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[hsl(var(--foreground))]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-glass text-center p-8 sm:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[hsl(var(--primary))] blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[hsl(var(--accent))] blur-[100px]" />
            </div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[hsl(var(--foreground))]">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-[hsl(var(--muted-foreground))] mb-8 max-w-xl mx-auto">
                Join thousands of professionals who found their dream jobs through
                JobPortal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                  Free forever
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-xl text-gradient">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
              </div>
              <span>JobPortal</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              © {new Date().getFullYear()} JobPortal. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
