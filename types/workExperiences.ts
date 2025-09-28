export interface WorkExperience {
  id?: number;
  company_name: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  user?: number;
  resume?: number | null;
}

export interface WorkExperienceCreateDTO extends Omit<WorkExperience, 'id' | 'user' | 'resume'> {}
export interface WorkExperienceUpdateDTO extends Partial<WorkExperienceCreateDTO> {}