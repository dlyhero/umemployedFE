"use client";
import { useState } from 'react';
import { Icon } from '@iconify/react';

interface Education {
  institution: string;
  degree: string;
  field_of_study?: string;
  graduation_year: number;
  location?: string;
  gpa?: string;
}

interface EducationSectionProps {
  education: Education[];
  isEditing: boolean;
  onUpdate: (education: Education[]) => void;
}

export default function EducationSection({ education, isEditing, onUpdate }: EducationSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempEducation, setTempEducation] = useState<Education | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setTempEducation(education[index]);
  };

  const handleSave = () => {
    if (editingIndex !== null && tempEducation) {
      const updatedEducation = [...education];
      updatedEducation[editingIndex] = tempEducation;
      onUpdate(updatedEducation);
      setEditingIndex(null);
      setTempEducation(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setTempEducation(null);
  };

  const handleAdd = () => {
    const newEducation: Education = {
      institution: '',
      degree: '',
      graduation_year: new Date().getFullYear(),
      gpa: ''
    };
    setEditingIndex(education.length);
    setTempEducation(newEducation);
  };

  const handleDelete = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    onUpdate(updatedEducation);
  };

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
          Education
        </h2>
        {isEditing && (
          <button
            onClick={handleAdd}
            className="ml-4 p-2 text-brand hover:text-brand2 transition-colors"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {education.map((edu, index) => (
          <div key={index} className="flex justify-between items-start">
            {editingIndex === index ? (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                    <input
                      type="text"
                      value={tempEducation?.degree || ''}
                      onChange={(e) => setTempEducation(prev => prev ? { ...prev, degree: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                    <input
                      type="text"
                      value={tempEducation?.institution || ''}
                      onChange={(e) => setTempEducation(prev => prev ? { ...prev, institution: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={tempEducation?.graduation_year || ''}
                      onChange={(e) => setTempEducation(prev => prev ? { ...prev, graduation_year: parseInt(e.target.value) || new Date().getFullYear() } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</label>
                    <input
                      type="text"
                      value={tempEducation?.gpa || ''}
                      onChange={(e) => setTempEducation(prev => prev ? { ...prev, gpa: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="3.8"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-brand">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {edu.graduation_year}
                  </span>
                  {isEditing && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(index)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Icon icon="lucide:edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Icon icon="lucide:trash-2" className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}