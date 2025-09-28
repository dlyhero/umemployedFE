"use client";
import { useState } from 'react';
import { Icon } from '@iconify/react';

interface Certification {
  name: string;
  issuer: string;
  date?: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
}

interface CertificationSectionProps {
  certifications: Certification[];
  isEditing: boolean;
  onUpdate: (certifications: Certification[]) => void;
}

export default function CertificationSection({ certifications, isEditing, onUpdate }: CertificationSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempCertification, setTempCertification] = useState<Certification | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setTempCertification(certifications[index]);
  };

  const handleSave = () => {
    if (editingIndex !== null && tempCertification) {
      const updatedCertifications = [...certifications];
      updatedCertifications[editingIndex] = tempCertification;
      onUpdate(updatedCertifications);
      setEditingIndex(null);
      setTempCertification(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setTempCertification(null);
  };

  const handleAdd = () => {
    const newCertification: Certification = {
      name: '',
      issuer: '',
      date: ''
    };
    setEditingIndex(certifications.length);
    setTempCertification(newCertification);
  };

  const handleDelete = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index);
    onUpdate(updatedCertifications);
  };

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
          Certifications
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
        {certifications.map((cert, index) => (
          <div key={index} className="flex justify-between items-start">
            {editingIndex === index ? (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                    <input
                      type="text"
                      value={tempCertification?.name || ''}
                      onChange={(e) => setTempCertification(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                    <input
                      type="text"
                      value={tempCertification?.issuer || ''}
                      onChange={(e) => setTempCertification(prev => prev ? { ...prev, issuer: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={tempCertification?.date || ''}
                    onChange={(e) => setTempCertification(prev => prev ? { ...prev, date: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Jun 2023"
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
                <div>
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-brand">{cert.issuer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {cert.date || cert.issue_date || 'No date'}
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