import React, { useState } from 'react';
import { toast } from 'sonner';
import { useEducations } from '@/hooks/profile/useEducation';
import { Icon } from '@iconify/react/dist/iconify.js';
import type { Education, EducationCreateDTO, EducationUpdateDTO } from '@/types/profile/education';

const Education = () => {
  const {
    educations,
    isLoading,
    isError,
    error,
    createEducation,
    updateEducation,
    deleteEducation,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEducations();

  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Partial<Education>>({
    institution_name: '',
    field_of_study: null,
    degree: '',
    graduation_year: new Date().getFullYear(),
  });

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEducation(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEducation(prev => ({ ...prev, [name]: value ? parseInt(value) : 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentEducation.id) {
        await updateEducation({
          id: currentEducation.id,
          data: currentEducation as EducationUpdateDTO
        });
        toast.success('Education updated successfully');
      } else {
        await createEducation(currentEducation as EducationCreateDTO);
        toast.success('Education added successfully');
      }
      resetForm();
      setIsAddingNew(false);
    } catch (error) {
      toast.error('Failed to save education');
    }
  };

  const handleEdit = (edu: Education) => {
    setCurrentEducation(edu);
    setIsAddingNew(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this education record?')) {
      try {
        await deleteEducation(id);
        toast.success('Education deleted successfully');
      } catch (error) {
        toast.error('Failed to delete education');
      }
    }
  };

  const resetForm = () => {
    setCurrentEducation({
      institution_name: '',
      field_of_study: null,
      degree: '',
      graduation_year: new Date().getFullYear(),
    });
  };

  // if (isLoading) return <div className="p-4 flex w-full justify-center min-h-[20v] items-center"><Icon icon="svg-spinners:6-dots-rotate" width="24" height="24" /></div>;
  if (isError) return <div className="p-4 text-red-500">Error: {error?.message}</div>;

  return (
    <div className="rounded-lg w-full bg-white my-6 p-3 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Education</h1>
        <button
          onClick={() => {
            resetForm();
            setIsAddingNew(true);
          }}
          className="px-8 py-2 bg-brand text-white rounded-full hover:bg-brand2"
        >
          Add 
        </button>
      </div>

      {isAddingNew && (
        <div className="mb-6 border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-nowrap">
            {currentEducation.id ? 'Edit Education' : 'Add New Education'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name*</label>
                <input
                  type="text"
                  name="institution_name"
                  value={currentEducation.institution_name || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree*</label>
                <input
                  type="text"
                  name="degree"
                  value={currentEducation.degree || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  name="field_of_study"
                  value={currentEducation.field_of_study || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year*</label>
                <input
                  type="number"
                  name="graduation_year"
                  value={currentEducation.graduation_year || ''}
                  onChange={handleNumberInputChange}
                  min="1900"
                  max="2100"
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {educations.length === 0 ? (
          <p className="text-gray-500">No education records added yet.</p>
        ) : (
          educations.map((edu, index) => (
            <div key={edu.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={() => toggleAccordion(index)}
              >
                <div className="text-left">
                  <h3 className="font-semibold">{edu.institution_name}</h3>
                  <p className="text-sm text-gray-600">
                    {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-4">
                    Graduated: {edu.graduation_year}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      activeAccordion === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {activeAccordion === index && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(edu)}
                      className="px-7 py-1 bg-brand text-white rounded-full hover:bg-brand2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(edu.id!)}
                      className="px-7 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Education;