export interface ResumeDetails {
  id: number;
  cv: string | null;
  profile_image: string | null;
  cover_image: string | null;
  created_at: string;
  first_name: string
  // ... other fields from your response
}