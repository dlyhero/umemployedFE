  export interface Language {
    id: number;
    name: string;
  }

  export interface UserLanguage {
    id: number;
    language: Language;
    language_id: number;
    proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native' | null;
  }

  export interface UserLanguageCreateDTO {
    language_id: number;
    proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native' | null;
  }

  export interface UserLanguageUpdateDTO extends Partial<UserLanguageCreateDTO> {}