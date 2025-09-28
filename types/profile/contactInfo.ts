export interface ContactInfo {
  id?: number;
  name: string;
  email: string;
  phone: string;
  country?: string;
  city?: string | null;
  date_of_birth?: string | null;
  job_title_name?: string;
  job_title_id: number;
}


export interface ContactInfoCreateDTO extends Omit<ContactInfo, 'id' | 'job_title_name'> {}
export interface ContactInfoUpdateDTO extends Partial<ContactInfoCreateDTO> {}