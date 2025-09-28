"use client";
import { useState } from 'react';
import { Icon } from '@iconify/react';

interface Experience {
  id?: number;
  company: string;
  position: string;
  period?: string;
  start_date: string;
  end_date: string;
  description: string;
  location?: string;
  is_current?: boolean;
}

interface ExperienceSectionProps {
  experiences: Experience[];
  isEditing: boolean;
  onUpdate: (experiences: Experience[]) => void;
}

export default function ExperienceSection({ experiences, isEditing, onUpdate }: ExperienceSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempExperience, setTempExperience] = useState<Experience | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setTempExperience(experiences[index]);
  };

  const handleSave = () => {
    if (editingIndex !== null && tempExperience) {
      const updatedExperiences = [...experiences];
      updatedExperiences[editingIndex] = tempExperience;
      onUpdate(updatedExperiences);
      setEditingIndex(null);
      setTempExperience(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setTempExperience(null);
  };

  const handleAdd = () => {
    const newExperience: Experience = {
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: ''
    };
    setEditingIndex(experiences.length);
    setTempExperience(newExperience);
  };

  const handleDelete = (index: number) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    onUpdate(updatedExperiences);
  };


  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
          Professional Experience
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
      
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div key={index} className="border-l-2 border-blue-200 pl-4">
            {editingIndex === index ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      value={tempExperience?.position || ''}
                      onChange={(e) => setTempExperience(prev => prev ? { ...prev, position: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={tempExperience?.company || ''}
                      onChange={(e) => setTempExperience(prev => prev ? { ...prev, company: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={tempExperience?.start_date || ''}
                      onChange={(e) => setTempExperience(prev => prev ? { ...prev, start_date: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="Jan 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="text"
                      value={tempExperience?.end_date || ''}
                      onChange={(e) => setTempExperience(prev => prev ? { ...prev, end_date: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="Present"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={tempExperience?.description || ''}
                    onChange={(e) => setTempExperience(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                  />
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
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-brand font-medium">{exp.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {exp.start_date} - {exp.end_date}
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
                </div>
                
                <p className="text-gray-700 mb-2 leading-relaxed">
                  {exp.description}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}