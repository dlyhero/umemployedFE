import { Icon } from '@iconify/react/dist/iconify.js';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useUserStats } from '@/hooks/profile/useUserStats';
import { useCompanyAnalytics } from '@/hooks/companies/useCompanyAnalytics';

// Format number for display (e.g., 1000 -> 1k, 1000000 -> 1M)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
};

// Stat card interface for type safety
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  isLoading: boolean;
  accentColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, isLoading, accentColor }) => (
  <div className="bg-white rounded-3xl p-8 flex-1 min-w-[250px] border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {isLoading ? (
          <>
            <div className="bg-gray-200 animate-pulse h-12 w-16 rounded-lg mb-3"></div>
            <div className="bg-gray-200 animate-pulse h-4 w-24 rounded"></div>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              {formatNumber(value)}
            </div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </div>
          </>
        )}
      </div>
      
      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center ${accentColor} flex-shrink-0 ml-4`}>
        <Icon icon={icon} className="w-7 h-7 md:w-10 md:h-10 text-white" />
      </div>
    </div>
  </div>
);

export default function Stats() {
  const { data: session } = useSession();
  
  // Fetch user stats
  const { data: userStats, isLoading, isError, error } = useUserStats();
  const { data: companyStats, isLoading: isCompanyLoading } = useCompanyAnalytics(session?.user?.companyId || '');
  
  console.log('Company Analytics Data:', companyStats);
  
  // Check if user is a recruiter
  const isRecruiter = session?.user?.role === 'recruiter';
  
  // Handle error state
  if (isError) {
    console.error('Error loading user stats:', error);
    return (
      <div className="mt-12 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Failed to load stats. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Stats configuration interface
  interface StatConfig {
    title: string;
    value: number;
    icon: string;
    accentColor: string;
  }
  
  // Get stats configuration based on user role
  const getStatsConfig = (): StatConfig[] => {
    if (isRecruiter) {
      // Recruiter stats configuration - using comprehensive analytics data
      return [
        {
          title: 'Total Jobs Posted',
          value: companyStats?.overview?.total_jobs_posted || 0,
          icon: 'solar:suitcase-outline',
          accentColor: 'bg-brand/90'
        },
        {
          title: 'Active Jobs',
          value: companyStats?.overview?.active_jobs || 0,
          icon: 'material-symbols-light:notifications-active-outline-sharp',
          accentColor: 'bg-brand/90'
        },
        {
          title: 'Total Applications',
          value: companyStats?.overview?.total_applications || 0,
          icon: 'mynaui:users-group',
          accentColor: 'bg-brand/90'
        },
        {
          title: 'Hired Candidates',
          value: companyStats?.overview?.hired_candidates || 0,
          icon: 'clarity:employee-group-line',
          accentColor: 'bg-brand/90'
        }
      ];
    } else {
      // Applicant stats configuration (default)
      return [
        {
          title: 'Total Visitors',
          value: userStats?.profileViews || 0,
          icon: 'lets-icons:eye-light',
          accentColor: 'bg-brand/90'
        },
        {
          title: 'Shortlisted',
          value: userStats?.applications || 0,
          icon: 'heroicons:bookmark-20-solid',
          accentColor: 'bg-brand/90'
        },
        {
          title: 'Views',
          value: userStats?.jobMatches || 0,
          icon: 'lets-icons:eye-light',
          accentColor: 'bg-brand/90'
        },
        {
          title: 'Applied Job',
          value: userStats?.skillEndorsements || 0,
          icon: 'heroicons:pencil-20-solid',
          accentColor: 'bg-brand/90'
        }
      ];
    }
  };
  
  const statsConfig = getStatsConfig();
  const currentIsLoading = isRecruiter ? isCompanyLoading : isLoading;
  
  return (
    <div className="mt-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statsConfig.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            isLoading={currentIsLoading}
            accentColor={stat.accentColor}
          />
        ))}
      </div>
    </div>
  );
}