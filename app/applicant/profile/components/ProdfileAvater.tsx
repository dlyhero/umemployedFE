import { useResumeDetails } from '@/hooks/profile/useResumeDetails';
import { useUserImages } from '@/hooks/profile/useUserImages';
import { Icon } from '@iconify/react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

const ProfileAvatar = () => {
  const { resumeDetails } = useResumeDetails();
  const { uploadImage, isUploading } = useUserImages();
  const [isHovering, setIsHovering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate initials safely
  const getInitials = () => {
    try {
      if (resumeDetails?.first_name) {
        return resumeDetails.first_name
          .split(' ')
          .filter(name => name.length > 0)
          .map(name => name[0].toUpperCase())
          .join('')
          .slice(0, 2);
      }
    } catch (error) {
      console.error('Error generating initials:', error);
    }
    return 'US'; // Default initials
  };

  const initials = getInitials();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    try {
      await uploadImage({ file });
      toast.success('Profile image updated successfully!');
      setImageError(false);
    } catch (error) {
      toast.error('Failed to update profile image');
      console.error('Upload error:', error);
    }
  };

  const triggerFileInput = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Reset image error when profile image changes
  useEffect(() => {
    setImageError(false);
  }, [resumeDetails?.profile_image]);

  return (
    <div 
      className="relative"
      onMouseEnter={() => !isUploading && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={isUploading}
      />

      <div className="relative w-32 h-32">
        {/* Loading overlay (always visible during upload) */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 rounded-full">
            <Icon 
              icon="heroicons:arrow-path" 
              className="w-8 h-8 text-white animate-spin" 
            />
          </div>
        )}

        {/* Clickable avatar area */}
        <div 
          className={`relative w-full h-full rounded-full border-2 border-white shadow-md overflow-hidden transition-opacity ${isUploading ? 'opacity-60' : 'cursor-pointer'}`}
          onClick={triggerFileInput}
        >
          {/* Profile image or initials */}
          {resumeDetails?.profile_image && !imageError ? (
            <img
              src={resumeDetails.profile_image}
              alt={`${resumeDetails.first_name || 'User'} profile`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center text-white text-4xl font-bold">
              {initials}
            </div>
          )}

          {/* Change photo hint (hover state) */}
          {isHovering && !isUploading && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-2">
              <Icon icon="heroicons:photo" className="w-6 h-6 mb-1" />
              <span className="text-xs">Change Photo</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfileAvatar;