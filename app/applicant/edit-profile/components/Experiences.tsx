import React, { useState } from 'react';
import { toast } from 'sonner';
import { WorkExperience, WorkExperienceCreateDTO } from '@/types/workExperiences';
import { useWorkExperiences } from '@/hooks/profile/workExperiences';
import { Icon } from '@iconify/react/dist/iconify.js';

const Experiences = () => {
    const {
        experiences,
        isLoading,
        isError,
        error,
        createExperience,
        updateExperience,
        deleteExperience,
        isCreating,
        isUpdating,
        isDeleting,
    } = useWorkExperiences();

    const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [currentExperience, setCurrentExperience] = useState<Partial<WorkExperience>>({
        company_name: '',
        role: '',
        start_date: '',
        end_date: '',
    });

    const toggleAccordion = (index: number) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentExperience(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentExperience.id) {
                try {
                    await updateExperience({
                        id: currentExperience.id,
                        data: currentExperience
                    });
                    toast.success('Experience updated successfully');
                } catch (updateError) {
                    // If update fails (404), try creating as new
                    await createExperience(currentExperience as WorkExperienceCreateDTO);
                    toast.success('Created as new experience successfully');
                }
            } else {
                await createExperience(currentExperience as WorkExperienceCreateDTO);
                toast.success('Experience added successfully');
            }
            resetForm();
            setIsAddingNew(false);
        } catch (error) {
            console.error('Error saving experience:', error);
            toast.error(`Failed to save experience: ${error}`);
        }
    };

    const handleEdit = (exp: WorkExperience) => {
        setCurrentExperience({
            ...exp,
            start_date: exp.start_date || '',
            end_date: exp.end_date || ''
        });
        setIsAddingNew(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this experience?')) {
            try {
                await deleteExperience(id);
                toast.success('Experience deleted successfully');
            } catch (eror) {
                console.error('Error deleting experience:', error);
                toast.error(`Failed to delete experience: ${error}`);
            }
        }
    };

    const resetForm = () => {
        setCurrentExperience({
            company_name: '',
            role: '',
            start_date: '',
            end_date: '',
        });
    };

    // if (isLoading) return <div className="p-4 flex w-full justify-center min-h-[20v] items-center"><Icon icon="svg-spinners:6-dots-rotate" width="24" height="24" /></div>;


    if (isError) return <div className="p-4 text-red-500">Error: {error?.message}</div>;

    return (
        <div className="rounded-lg w-full bg-white my-6 p-3 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-semibold">Work Experience</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setIsAddingNew(true);
                    }}
                    className="px-8 py-2 bg-brand/90 text-white rounded-full hover:bg-brand"
                >
                    Add 
                </button>
            </div>

            {isAddingNew && (
                <div className="mb-6 border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">
                        {currentExperience.id ? 'Edit Experience' : 'Add New Experience'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name*</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={currentExperience.company_name || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={currentExperience.role || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={currentExperience.start_date || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={currentExperience.end_date || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsAddingNew(false)}
                                className="px-8 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2 bg-brand text-white hover:bg-brand/90 rounded-full"
                                disabled={isCreating || isUpdating}
                            >
                                {isCreating || isUpdating ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {experiences?.length === 0 ? (
                    <p className="text-gray-500">No work experiences added yet.</p>
                ) : (
                    experiences?.map((exp, index) => (
                        <div key={exp.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                                onClick={() => toggleAccordion(index)}
                            >
                                <div className="text-left">
                                    <h3 className="font-semibold">{exp.company_name}</h3>
                                    <p className="text-sm text-gray-600">{exp.role}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-4">
                                        {exp.start_date} - {exp.end_date || 'Present'}
                                    </span>
                                    <svg
                                        className={`w-5 h-5 transition-transform ${activeAccordion === index ? 'transform rotate-180' : ''
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
                                            onClick={() => handleEdit(exp)}
                                            className="px-7 py-1 bg-brand/90 text-white rounded-full hover:bg-brand text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exp.id!)}
                                            className="px-8 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm"
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

export default Experiences;