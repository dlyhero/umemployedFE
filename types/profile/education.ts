export interface Education {
  id?: number;
  institution_name: string;
  field_of_study?: string | null;
  degree: string;
  graduation_year: number;
  user?: number;
}

export interface EducationCreateDTO extends Omit<Education, 'id' | 'user'> {}
export interface EducationUpdateDTO extends Partial<EducationCreateDTO> {}