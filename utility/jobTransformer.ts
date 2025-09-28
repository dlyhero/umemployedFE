// @/utility/jobTransformer.ts

interface JobRequirement {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
  location: string;
  description: string | null;
  industry: string;
  size: string;
  founded: number;
  website_url: string | null;
  country: string;
  country_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  linkedin: string | null;
  video_introduction: string | null;
  logo: string;
  cover_photo: string;
  mission_statement: string | null;
  job_openings: number | null;
}

export interface RawJob {
  id: number;
  title: string;
  hire_number: number;
  job_location_type: string;
  job_type: string;
  location: string;
  salary_range: string;
  category: number;
  description: string;
  responsibilities: string;
  benefits: string;
  requirements: JobRequirement[];
  level: string;
  experience_levels: string;
  weekly_ranges: string;
  shifts: string;
  created_at: string;
  is_saved: boolean;
  is_applied: boolean;
  company: Company;
  has_started: boolean;
}

export interface TransformedJob {
  id: number;
  title: string;
  hireNumber: number;
  jobType: string;
  rawJobType: string; // Add raw job type for forms
  locationType: string;
  location: string;
  salary: string;
  salaryRange: string; // Original salary range for forms
  category: number;
  level: string; // Direct level field from API
  company: {
    name: string;
    logo: string;
    industry: string;
    country: string;
    countryName: string;
  };
  postedDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isSaved: boolean;
  hasApplied: boolean;
  details: {
    responsibilities: string;
    experienceLevel: string;
    workSchedule: string;
    shift: string;
  };
}

const DEFAULT_LOGO_URL = "https://umemployeds1.blob.core.windows.net/umemployedcont1/resume/images/default.jpg";

const getIndustryLogo = (industry: string): string => {
  // Map industries to Iconify logos
  const industryLogos: Record<string, string> = {
    'technology': 'logos:google',
    'software': 'logos:microsoft',
    'it': 'logos:aws',
    'finance': 'logos:visa',
    'banking': 'logos:mastercard',
    'insurance': 'logos:allianz',
    'healthcare': 'logos:stethoscope',
    'medical': 'logos:redhat',
    'pharmaceutical': 'logos:pfizer',
    'education': 'logos:google-scholar',
    'university': 'logos:apple',
    'retail': 'logos:amazon-icon',
    'ecommerce': 'logos:shopify',
    'manufacturing': 'logos:tesla',
    'automotive': 'logos:volkswagen',
    'hospitality': 'logos:airbnb',
    'travel': 'logos:booking',
    'construction': 'logos:caterpillar',
    'engineering': 'logos:bosch',
    'transportation': 'logos:uber',
    'logistics': 'logos:fedex',
    'entertainment': 'logos:netflix',
    'media': 'logos:disney',
    'telecommunications': 'logos:verizon',
    'energy': 'logos:bp',
    'oil': 'logos:shell',
    'agriculture': 'logos:john-deere',
    'food': 'logos:starbucks',
    'government': 'logos:united-states',
    'non-profit': 'logos:red-cross',
    'real estate': 'logos:zillow',
    'aeronautics': 'logos:boeing',
    'space': 'logos:spacex',
    'consulting': 'logos:accenture',
    'marketing': 'logos:facebook',
    'advertising': 'logos:google-ads'
  };

  // Normalize industry name for matching
  const normalizedIndustry = industry.toLowerCase().trim();

  // Find exact match first
  if (industryLogos[normalizedIndustry]) {
    return `https://api.iconify.design/${industryLogos[normalizedIndustry]}.svg`;
  }

  // Find partial matches
  for (const [key, logo] of Object.entries(industryLogos)) {
    if (normalizedIndustry.includes(key)) {
      return `https://api.iconify.design/${logo}.svg`;
    }
  }

  // Default fallback logo
  return 'https://api.iconify.design/logos:google.svg';
};

const formatSalary = (range: string): string => {
  if (!range) return 'Not specified';
  if (range.includes('-')) {
    const [min, max] = range.split('-');
    return `${parseInt(min).toLocaleString()} - ${parseInt(max).toLocaleString()}`;
  }
  return `${parseInt(range).toLocaleString()}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatJobType = (jobType: string): string => {
  if (!jobType) return jobType;
  
  // Replace underscores with spaces and capitalize properly
  return jobType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export const transformJob = (rawJob: RawJob): TransformedJob => {
  // Replace default logo with industry-specific logo
  const logo = rawJob.company.logo === DEFAULT_LOGO_URL
    ? getIndustryLogo(rawJob.company.industry)
    : rawJob.company.logo;

  return {
    id: rawJob.id,
    title: rawJob.title,
    hireNumber: rawJob.hire_number,
    jobType: formatJobType(rawJob.job_type), // Format job type for display
    rawJobType: rawJob.job_type, // Keep raw job type for forms
    locationType: rawJob.job_location_type,
    location: rawJob.location, // Use the job location, not company country
    salary: formatSalary(rawJob.salary_range),
    salaryRange: rawJob.salary_range, // Original salary range for forms
    category: rawJob.category,
    level: rawJob.level, // Direct level field from API
    company: {
      name: rawJob.company.name,
      logo: logo,
      industry: rawJob.company.industry,
      country: rawJob.company.country,
      countryName: rawJob.company.country_name
    },
    postedDate: formatDate(rawJob.created_at),
    description: rawJob.description,
    requirements: rawJob.requirements.map(req => req.name),
    benefits: rawJob.benefits.split('\n').filter(item => item.trim() !== ''),
    isSaved: rawJob.is_saved, // Transform snake_case to camelCase
    hasApplied: rawJob.is_applied,
    details: {
      responsibilities: rawJob.responsibilities,
      experienceLevel: rawJob.experience_levels,
      workSchedule: rawJob.weekly_ranges,
      shift: rawJob.shifts
    }
  };
};

export const transformJobs = (rawJobs: RawJob[]): TransformedJob[] => {
  if (!rawJobs || !Array.isArray(rawJobs)) {
    console.warn('transformJobs received invalid data:', rawJobs);
    return [];
  }

  const transformed = rawJobs.map(job => transformJob(job));
  
  // Debug the transformation
  const savedJobs = transformed.filter(job => job.isSaved);
 
  return transformed;
};