import { useEffect } from 'react';

/**
 * Hook to set page title consistently across the application
 * @param title - The page title (will be appended with " | UmEmployed")
 * @param description - Optional meta description
 */
export const usePageTitle = (title: string, description?: string) => {
  useEffect(() => {
    const fullTitle = title.includes('UmEmployed') ? title : `${title} | UmEmployed`;
    document.title = fullTitle;

    // Update meta description if provided
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'UmEmployed - Find Your Dream Job';
    };
  }, [title, description]);
};

/**
 * Utility function to set page title directly
 * @param title - The page title (will be appended with " | UmEmployed")
 */
export const setPageTitle = (title: string) => {
  const fullTitle = title.includes('UmEmployed') ? title : `${title} | UmEmployed`;
  document.title = fullTitle;
};