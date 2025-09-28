export interface UserImage {
  id: number;
  url: string; // URL of the uploaded image
  created_at?: string;
}

// For file uploads
export interface ImageUploadDTO {
  file: File;
}

// For updates (if supporting file replacement)
export interface ImageUpdateDTO {
  file?: File;
}