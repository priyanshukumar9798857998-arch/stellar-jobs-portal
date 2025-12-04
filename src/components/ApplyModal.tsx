import React, { useState, useRef } from 'react';
import { X, Upload, Link as LinkIcon, FileText, Loader2 } from 'lucide-react';
import { storageAPI, jobsAPI } from '@/utils/api';
import { useToastContext } from './ToastContext';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
}) => {
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [errors, setErrors] = useState<{ resume?: string; general?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToastContext();

  const validateForm = (): boolean => {
    const newErrors: { resume?: string } = {};

    if (!resumeUrl.trim()) {
      newErrors.resume = 'Please provide your resume';
    } else if (uploadMode === 'url' && !isValidUrl(resumeUrl)) {
      newErrors.resume = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ resume: 'Please upload a PDF or Word document' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ resume: 'File size must be less than 5MB' });
      return;
    }

    setIsUploading(true);
    setErrors({});

    try {
      // Try to get presigned URL
      const presignResponse = await storageAPI.getPresignedUrl(file.name);
      const { url, publicUrl } = presignResponse.data;

      // Upload to presigned URL
      await storageAPI.uploadToPresignedUrl(url, file);

      setResumeUrl(publicUrl);
      setUploadedFileName(file.name);
      addToast({
        type: 'success',
        title: 'Resume uploaded',
        message: file.name,
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback: switch to URL mode
      setUploadMode('url');
      addToast({
        type: 'info',
        title: 'Direct upload unavailable',
        message: 'Please enter your resume URL instead',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await jobsAPI.apply(jobId, {
        resumeUrl,
        coverLetter: coverLetter.trim() || undefined,
      });

      addToast({
        type: 'success',
        title: 'Application submitted!',
        message: `Your application for ${jobTitle} has been sent.`,
      });

      onClose();
      resetForm();
    } catch (error: unknown) {
      console.error('Application error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
      setErrors({ general: errorMessage });
      addToast({
        type: 'error',
        title: 'Application failed',
        message: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setResumeUrl('');
    setCoverLetter('');
    setUploadedFileName('');
    setErrors({});
    setUploadMode('file');
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="apply-modal-title"
            className="text-xl font-bold text-[hsl(var(--foreground))]"
          >
            Apply for {jobTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors focus-ring"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                uploadMode === 'file'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.8)]'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                uploadMode === 'url'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.8)]'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Enter URL
            </button>
          </div>

          {/* Resume Input */}
          <div>
            <label htmlFor="resume" className="form-label">
              Resume *
            </label>
            {uploadMode === 'file' ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  errors.resume
                    ? 'border-[hsl(var(--destructive))]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Click to upload resume"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Uploading...
                    </span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-[hsl(var(--success))]" />
                    <span className="text-sm text-[hsl(var(--foreground))] font-medium">
                      {uploadedFileName}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      Click to replace
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Click to upload PDF or Word document
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      Max size: 5MB
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="url"
                id="resume"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/your-resume.pdf"
                className={`input-glass ${errors.resume ? 'input-error' : ''}`}
                aria-invalid={!!errors.resume}
                aria-describedby={errors.resume ? 'resume-error' : undefined}
              />
            )}
            {errors.resume && (
              <p id="resume-error" className="form-error" role="alert">
                {errors.resume}
              </p>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label htmlFor="coverLetter" className="form-label">
              Cover Letter (Optional)
            </label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell us why you're a great fit for this role..."
              rows={4}
              className="input-glass resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 text-right">
              {coverLetter.length}/2000
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div
              className="p-4 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)]"
              role="alert"
            >
              <p className="text-sm text-[hsl(var(--destructive))]">
                {errors.general}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="btn-secondary focus-ring"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary focus-ring flex items-center gap-2"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
