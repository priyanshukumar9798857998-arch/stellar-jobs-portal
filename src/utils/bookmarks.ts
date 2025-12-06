// Bookmarks service using localStorage
const BOOKMARKS_KEY = 'job_portal_bookmarks';

export const getBookmarks = (): string[] => {
  const stored = localStorage.getItem(BOOKMARKS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addBookmark = (jobId: string): string[] => {
  const bookmarks = getBookmarks();
  if (!bookmarks.includes(jobId)) {
    bookmarks.push(jobId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }
  return bookmarks;
};

export const removeBookmark = (jobId: string): string[] => {
  const bookmarks = getBookmarks().filter((id) => id !== jobId);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  return bookmarks;
};

export const isBookmarked = (jobId: string): boolean => {
  return getBookmarks().includes(jobId);
};

export const toggleBookmark = (jobId: string): { bookmarks: string[]; isBookmarked: boolean } => {
  if (isBookmarked(jobId)) {
    return { bookmarks: removeBookmark(jobId), isBookmarked: false };
  }
  return { bookmarks: addBookmark(jobId), isBookmarked: true };
};
