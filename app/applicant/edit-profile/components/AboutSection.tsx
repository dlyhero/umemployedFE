// components/AboutSection.tsx
import { useAbout } from '@/hooks/profile/useAbout';
import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function AboutSection() {
  const {
    aboutData,
    isLoading,
    isError,
    error,
    upsertAbout,
    isUpdating,
  } = useAbout();

  const [bio, setBio] = useState(aboutData?.bio || '');
  const [description, setDescription] = useState(aboutData?.description || '');

  // Initialize form when data loads
  React.useEffect(() => {
    if (aboutData) {
      setBio(aboutData.bio || '');
      setDescription(aboutData.description || '');
    }
  }, [aboutData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await upsertAbout({ bio, description });
      toast.success('About information saved successfully');
    } catch (error) {
      toast.error('Failed to save about information');
    }
  };
    // if (isLoading) return <div className="p-4 flex w-full justify-center min-h-[20v] items-center"><Icon icon="svg-spinners:6-dots-rotate" width="24" height="24" /></div>;
  

if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className='rounded-lg w-full bg-white my-6 p-3 md:p-6'>
      <h1 className='text-2xl md:text-3xl font-semibold mb-6'>About</h1>

      <div className='space-y-6'>
        <div>
          <label htmlFor='bio' className='block text-sm font-medium text-gray-700 mb-2'>
            Bio
          </label>
          <textarea
            id='bio'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className='w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40vh]'
            placeholder='A short bio about yourself'
          />
        </div>

      
      </div>

      <div className='flex justify-end mt-6'>
        <button
          onClick={() => handleSubmit()}
          disabled={isUpdating}
          className={`px-8 py-2 rounded-full text-white ${isUpdating ? 'bg-brand/70' : 'bg-brand hover:bg-brand/90'} transition-colors`}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}