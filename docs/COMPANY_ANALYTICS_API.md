# Company Analytics API Documentation

## Overview
The Company Analytics API provides comprehensive insights and statistics for recruiters to track their hiring performance, job posting effectiveness, and overall company recruitment metrics.

## Endpoint

**Path:** `GET /api/company/company/{company_id}/analytics/`

**Authentication:** Required (Bearer Token)

**Permissions:** 
- Company owner only
- Admin users (staff) can access any company's analytics

---

## Request

### URL Parameters
- `company_id` (integer, required): The ID of the company to get analytics for

### Headers
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Example Request
```javascript
const getCompanyAnalytics = async (companyId, jwtToken) => {
    try {
        const response = await fetch(`/api/company/company/${companyId}/analytics/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const analytics = await response.json();
            return analytics;
        } else {
            throw new Error(`Error: ${response.status}`);
        }
    } catch (error) {
        console.error('Failed to fetch company analytics:', error);
        throw error;
    }
};
```

---

## Response Structure

### Success Response (200 OK)

```json
{
    "company_info": {
        "id": 1,
        "name": "TechCorp Inc.",
        "industry": "Technology",
        "size": "51-200",
        "location": "San Francisco, CA",
        "founded": 2018,
        "created_at": "2023-01-15T10:30:00Z"
    },
    "overview": {
        "total_jobs_posted": 45,
        "active_jobs": 12,
        "total_applications": 1250,
        "applications_last_30_days": 180,
        "total_interviews": 85,
        "hired_candidates": 23,
        "company_age_days": 642,
        "avg_applications_per_job": 27.78
    },
    "job_posting_stats": {
        "by_job_type": [
            {"job_type": "Full_time", "count": 38},
            {"job_type": "Contract", "count": 5},
            {"job_type": "Internship", "count": 2}
        ],
        "by_location_type": [
            {"job_location_type": "remote", "count": 25},
            {"job_location_type": "hybrid", "count": 15},
            {"job_location_type": "onsite", "count": 5}
        ],
        "by_experience_level": [
            {"experience_levels": "3-5Years", "count": 20},
            {"experience_levels": "1-3Years", "count": 15},
            {"experience_levels": "5-10Years", "count": 10}
        ],
        "salary_analysis": {
            "avg_salary": 95000,
            "min_salary": 45000,
            "max_salary": 180000
        },
        "popular_job_titles": [
            {"title": "Software Engineer", "count": 8},
            {"title": "Frontend Developer", "count": 6},
            {"title": "Data Scientist", "count": 4}
        ],
        "avg_hire_number": 2.4
    },
    "application_metrics": {
        "status_breakdown": [
            {"status": "pending", "count": 980},
            {"status": "accepted", "count": 170},
            {"status": "rejected", "count": 100}
        ],
        "timeline": [
            {"month": "March 2025", "applications": 45},
            {"month": "April 2025", "applications": 67},
            {"month": "May 2025", "applications": 89},
            {"month": "June 2025", "applications": 123},
            {"month": "July 2025", "applications": 156},
            {"month": "August 2025", "applications": 180}
        ],
        "top_jobs_by_applications": [
            {
                "id": 123,
                "title": "Senior React Developer",
                "application_count": 89,
                "created_at": "2025-07-15T10:00:00Z"
            }
        ],
        "completion_rate": 85.6,
        "avg_quiz_score": 7.2,
        "avg_matching_percentage": 76.5,
        "total_completed_quizzes": 1070
    },
    "hiring_performance": {
        "hiring_rate": 13.6,
        "rejection_rate": 8.0,
        "pending_rate": 78.4,
        "interviews_conducted": 85,
        "interview_to_hire_ratio": 27.1,
        "hiring_by_job_title": [
            {"job__title": "Software Engineer", "count": 8, "avg_score": 8.2},
            {"job__title": "Frontend Developer", "count": 6, "avg_score": 7.9}
        ],
        "accepted_applications": 170,
        "avg_score_of_hired": 8.4
    },
    "trends": {
        "monthly_job_posting": [
            {"month": "Sep 2024", "jobs_posted": 2},
            {"month": "Oct 2024", "jobs_posted": 4},
            {"month": "Nov 2024", "jobs_posted": 6},
            {"month": "Dec 2024", "jobs_posted": 3},
            {"month": "Jan 2025", "jobs_posted": 8},
            {"month": "Feb 2025", "jobs_posted": 5},
            {"month": "Mar 2025", "jobs_posted": 7},
            {"month": "Apr 2025", "jobs_posted": 10},
            {"month": "May 2025", "jobs_posted": 12},
            {"month": "Jun 2025", "jobs_posted": 9},
            {"month": "Jul 2025", "jobs_posted": 15},
            {"month": "Aug 2025", "jobs_posted": 8}
        ],
        "weekly_applications": [
            {"week": "Week of Jul 01", "applications": 45},
            {"week": "Week of Jul 08", "applications": 52},
            {"week": "Week of Jul 15", "applications": 38},
            {"week": "Week of Jul 22", "applications": 67},
            {"week": "Week of Jul 29", "applications": 43},
            {"week": "Week of Aug 05", "applications": 59},
            {"week": "Week of Aug 12", "applications": 71},
            {"week": "Week of Aug 19", "applications": 48}
        ],
        "job_posting_growth_rate": 12.5,
        "application_growth_rate": 23.8,
        "jobs_this_month": 8,
        "jobs_last_month": 15,
        "apps_this_month": 180,
        "apps_last_month": 156
    },
    "geographic_data": {
        "applications_by_country": [
            {"job__location": "US", "count": 450},
            {"job__location": "CA", "count": 280},
            {"job__location": "UK", "count": 120}
        ],
        "jobs_by_location_type": [
            {"job_location_type": "remote", "count": 25},
            {"job_location_type": "hybrid", "count": 15},
            {"job_location_type": "onsite", "count": 5}
        ],
        "remote_jobs_percentage": 55.6
    },
    "engagement_metrics": {
        "avg_company_rating": 4.2,
        "total_ratings": 34,
        "daily_applications_last_30_days": [
            {"date": "2025-08-01", "applications": 6},
            {"date": "2025-08-02", "applications": 8},
            {"date": "2025-08-03", "applications": 4},
            // ... (30 days of data)
        ],
        "applications_by_day_of_week": [
            {"day": "Monday", "applications": 180},
            {"day": "Tuesday", "applications": 195},
            {"day": "Wednesday", "applications": 167},
            {"day": "Thursday", "applications": 203},
            {"day": "Friday", "applications": 145},
            {"day": "Saturday", "applications": 89},
            {"day": "Sunday", "applications": 71}
        ],
        "most_active_day": "Thursday",
        "avg_daily_applications": 1.95
    },
    "last_updated": "2025-09-25T10:30:00.123456Z"
}
```

---

## Error Responses

### 403 Forbidden - Access Denied
```json
{
    "error": "Access denied. You don't have permission to view this company's analytics."
}
```

### 404 Not Found - Company Not Found
```json
{
    "error": "Company not found."
}
```

### 500 Internal Server Error
```json
{
    "error": "An error occurred while generating analytics: [error details]"
}
```

---

## Frontend Implementation Guide

### 1. Analytics Dashboard Component

```javascript
import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

const CompanyAnalyticsDashboard = ({ companyId, jwtToken }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [companyId]);

    const fetchAnalytics = async () => {
        try {
            const data = await getCompanyAnalytics(companyId, jwtToken);
            setAnalytics(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading analytics...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!analytics) return <div>No data available</div>;

    return (
        <div className="analytics-dashboard">
            <OverviewCards overview={analytics.overview} />
            <JobPostingCharts jobStats={analytics.job_posting_stats} />
            <ApplicationTrends trends={analytics.trends} />
            <HiringPerformance performance={analytics.hiring_performance} />
            <GeographicInsights geographic={analytics.geographic_data} />
            <EngagementMetrics engagement={analytics.engagement_metrics} />
        </div>
    );
};
```

### 2. Overview Cards Component

```javascript
const OverviewCards = ({ overview }) => {
    const cards = [
        {
            title: "Total Jobs Posted",
            value: overview.total_jobs_posted,
            icon: "📋",
            color: "blue"
        },
        {
            title: "Active Jobs",
            value: overview.active_jobs,
            icon: "🎯",
            color: "green"
        },
        {
            title: "Total Applications",
            value: overview.total_applications.toLocaleString(),
            icon: "👥",
            color: "purple"
        },
        {
            title: "Applications (30 days)",
            value: overview.applications_last_30_days,
            icon: "📈",
            color: "orange"
        },
        {
            title: "Hired Candidates",
            value: overview.hired_candidates,
            icon: "✅",
            color: "green"
        },
        {
            title: "Avg Applications/Job",
            value: overview.avg_applications_per_job,
            icon: "📊",
            color: "blue"
        }
    ];

    return (
        <div className="overview-cards">
            {cards.map((card, index) => (
                <div key={index} className={`card card-${card.color}`}>
                    <div className="card-icon">{card.icon}</div>
                    <div className="card-content">
                        <h3>{card.value}</h3>
                        <p>{card.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
```

### 3. Charts Implementation

```javascript
const ApplicationTrendsChart = ({ trends }) => {
    const chartData = {
        labels: trends.weekly_applications.map(item => item.week),
        datasets: [
            {
                label: 'Applications',
                data: trends.weekly_applications.map(item => item.applications),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Weekly Application Trends'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return <Line data={chartData} options={options} />;
};

const JobTypeDistribution = ({ jobStats }) => {
    const chartData = {
        labels: jobStats.by_job_type.map(item => item.job_type),
        datasets: [
            {
                data: jobStats.by_job_type.map(item => item.count),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }
        ]
    };

    return <Doughnut data={chartData} />;
};

const HiringFunnelChart = ({ performance }) => {
    const chartData = {
        labels: ['Total Applications', 'Interviews', 'Hired'],
        datasets: [
            {
                label: 'Hiring Funnel',
                data: [
                    performance.accepted_applications + 
                    (performance.pending_rate / 100) * 1000 + // Approximate pending
                    (performance.rejection_rate / 100) * 1000, // Approximate rejected
                    performance.interviews_conducted,
                    performance.accepted_applications
                ],
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1']
            }
        ]
    };

    return <Bar data={chartData} options={{ responsive: true }} />;
};
```

### 4. Key Metrics Display

```javascript
const KeyMetrics = ({ analytics }) => {
    const metrics = [
        {
            category: "Hiring Performance",
            items: [
                { label: "Hiring Rate", value: `${analytics.hiring_performance.hiring_rate}%` },
                { label: "Interview to Hire Ratio", value: `${analytics.hiring_performance.interview_to_hire_ratio}%` },
                { label: "Average Quiz Score (Hired)", value: analytics.hiring_performance.avg_score_of_hired }
            ]
        },
        {
            category: "Application Quality",
            items: [
                { label: "Completion Rate", value: `${analytics.application_metrics.completion_rate}%` },
                { label: "Average Quiz Score", value: analytics.application_metrics.avg_quiz_score },
                { label: "Average Matching %", value: `${analytics.application_metrics.avg_matching_percentage}%` }
            ]
        },
        {
            category: "Growth Trends",
            items: [
                { label: "Job Posting Growth", value: `${analytics.trends.job_posting_growth_rate}%` },
                { label: "Application Growth", value: `${analytics.trends.application_growth_rate}%` },
                { label: "Remote Jobs", value: `${analytics.geographic_data.remote_jobs_percentage}%` }
            ]
        }
    ];

    return (
        <div className="key-metrics">
            {metrics.map((category, index) => (
                <div key={index} className="metric-category">
                    <h3>{category.category}</h3>
                    <div className="metric-items">
                        {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="metric-item">
                                <span className="metric-label">{item.label}</span>
                                <span className="metric-value">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
```

### 5. Data Export Functionality

```javascript
const exportAnalytics = (analytics) => {
    const exportData = {
        company: analytics.company_info.name,
        export_date: new Date().toISOString(),
        overview: analytics.overview,
        job_posting_stats: analytics.job_posting_stats,
        application_metrics: analytics.application_metrics,
        hiring_performance: analytics.hiring_performance
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analytics.company_info.name}_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

const ExportButton = ({ analytics }) => (
    <button 
        onClick={() => exportAnalytics(analytics)}
        className="export-button"
    >
        📊 Export Analytics
    </button>
);
```

---

## Chart Recommendations

### 1. **Overview Dashboard**
- Use card-based layout for key metrics
- Color-coded cards for different metric types
- Include trend indicators (up/down arrows)

### 2. **Trend Charts**
- Line charts for time-series data (applications over time)
- Bar charts for categorical comparisons (job types, experience levels)
- Doughnut charts for distribution data (location types, application status)

### 3. **Performance Metrics**
- Funnel chart for hiring pipeline
- Gauge charts for rates (hiring rate, completion rate)
- Heat maps for daily/weekly activity patterns

### 4. **Geographic Data**
- World map visualization for global applications
- Bar chart for top countries/regions
- Pie chart for remote vs onsite distribution

---

## Usage Examples

### Real-time Dashboard
```javascript
// Refresh analytics every 5 minutes
useEffect(() => {
    const interval = setInterval(() => {
        fetchAnalytics();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
}, []);
```

### Performance Alerts
```javascript
const checkPerformanceAlerts = (analytics) => {
    const alerts = [];
    
    if (analytics.hiring_performance.hiring_rate < 5) {
        alerts.push({
            type: 'warning',
            message: 'Low hiring rate detected. Consider reviewing job requirements.'
        });
    }
    
    if (analytics.application_metrics.completion_rate < 60) {
        alerts.push({
            type: 'info',
            message: 'Low quiz completion rate. Consider simplifying assessments.'
        });
    }
    
    return alerts;
};
```

### Comparative Analysis
```javascript
const compareWithPreviousMonth = (current, previous) => {
    return {
        applications: {
            current: current.applications_last_30_days,
            change: ((current.applications_last_30_days - previous.applications_last_30_days) / previous.applications_last_30_days * 100).toFixed(1)
        },
        hiring_rate: {
            current: current.hiring_performance.hiring_rate,
            change: (current.hiring_performance.hiring_rate - previous.hiring_performance.hiring_rate).toFixed(1)
        }
    };
};
```

---

## Integration Notes

1. **Authentication**: Always include JWT token in headers
2. **Permissions**: Only company owners can access their analytics
3. **Caching**: Consider caching analytics data for better performance
4. **Loading States**: Show loading indicators for data-heavy requests
5. **Error Handling**: Implement proper error handling for failed requests
6. **Real-time Updates**: Consider WebSocket integration for live updates
7. **Mobile Responsive**: Ensure charts work well on mobile devices

This endpoint provides comprehensive company analytics that can power a full-featured recruitment dashboard with insights into hiring performance, job posting effectiveness, and candidate engagement metrics.
