// types/profile/skill.ts
export interface Skill {
  id?: number;
  name: string;
  is_extracted?: boolean;
  user?: number;
  categories: number[];
}

export interface AvailableSkill {
  id: number;
  name: string;
  categories?: number[];
}

export interface SkillCreateDTO {
  skill_id: number;
}

export interface SkillUpdateDTO extends Partial<Omit<Skill, 'id' | 'user' | 'is_extracted'>> {}

export interface SkillsListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: AvailableSkill[];
}