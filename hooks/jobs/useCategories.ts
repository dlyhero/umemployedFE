// @/hooks/jobs/useCategories.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the raw category interface from API response
export interface RawCategory {
  id: number;
  name: string;
  db_id: number;
  job_count: number;
}

// Transformed category interface for UI
export interface Category {
  id: number;
  name: string;
  dbId: number;
  jobCount: number;
  icon: string; // We'll map this from the name
}

// Icon mapping based on category names
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    // Technology & Development
    'Software Engineering': 'streamline-ultimate-color:app-window-code',
    'Data Science': 'streamline-ultimate-color:analytics-pie-2',
    'Data Science & Analytics': 'logos:google-analytics',
    'Machine Learning & AI': 'vscode-icons:file-type-ai',
    'DevOps & SRE': 'devicon:azuredevops',
    'Cloud Engineering': 'material-symbols:cloud',
    'Quality Assurance & Testing': 'material-symbols:bug-report',
    'Data Engineering': 'material-symbols:database',
    'Mobile Development': 'material-symbols:smartphone',
    
    // Design & UX
    'Design & UX': 'material-symbols:design-services',
    'UI/UX Design': 'material-symbols:design-services',
    
    // Management
    'Product Management': 'streamline-plump-color:production-belt-flat',
    
    // Security
    'Cybersecurity': 'material-symbols:security',
    
    // Business
    'Sales & Business Development': 'material-symbols:handshake',
    'Sales': 'material-symbols:trending-up',
    'Marketing': 'material-symbols:campaign',
    'Business Analysis': 'material-symbols:analytics',
    'Operations': 'material-symbols:settings',
    
    // Finance & HR
    'Finance & Accounting': 'material-symbols:account-balance',
    'Human Resources': 'material-symbols:groups',
    
    // Support & Legal
    'Customer Support': 'material-symbols:support-agent',
    'Legal': 'material-symbols:gavel',
    
    // Industries
    'Healthcare': 'material-symbols:medical-services',
    'Education & Training': 'material-symbols:school',
    'Construction & Engineering': 'material-symbols:construction',
    'Manufacturing': 'material-symbols:precision-manufacturing',
    'Logistics & Supply Chain': 'material-symbols:local-shipping',
    'Government & Public Sector': 'material-symbols:account-balance',
    'Research & Development': 'material-symbols:science',
    'Technology': 'material-symbols:computer',
    'Finance': 'material-symbols:account-balance',
    'Retail': 'material-symbols:shopping-cart',
    'Hospitality': 'material-symbols:hotel',
    'Transportation': 'material-symbols:directions-car',
    
    // Default
    'Other': 'material-symbols:work'
  };

  return iconMap[categoryName] || 'material-symbols:work';
};

// Transform function for categories
export const transformCategories = (categories: RawCategory[]): Category[] => {
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    dbId: category.db_id,
    jobCount: category.job_count,
    icon: getCategoryIcon(category.name)
  }));
};

const fetchCategories = async (): Promise<RawCategory[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/job/job-options/`,
    );
    // The API returns an object with a categories array
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    select: (categories) => {
      const transformedCategories = transformCategories(categories);
      return {
        allCategories: transformedCategories,
        totalCount: categories.length
      };
    },
    staleTime: 1000 * 60 * 10 // 10 minutes cache since categories don't change often
  });
};

export default useCategories;