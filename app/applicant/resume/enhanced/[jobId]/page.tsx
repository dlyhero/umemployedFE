"use client";
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useEnhancedResume } from '@/hooks/useEnhancedResume';
import { useJobDetail } from '@/hooks/jobs/useJobDetails';
import { useUpdateEnhancedResume } from '@/hooks/useEnhancedResume';
import ExperienceSection from '@/components/resume/ExperienceSection';
import EducationSection from '@/components/resume/EducationSection';
import CertificationSection from '@/components/resume/CertificationSection';
import { downloadResumeAsPDF } from './pdf-download';

export default function EnhancedResumeViewPage() {
  const { jobId } = useParams() as { jobId: string };
  const router = useRouter();
  const { data: session } = useSession();
  const resumeRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { data: enhancedResume, isLoading, error } = useEnhancedResume(
    session?.user?.id ? Number(session.user.id) : undefined, 
    Number(jobId)
  );
  const { data: job } = useJobDetail(Number(jobId));
  const updateResumeMutation = useUpdateEnhancedResume();
  
  // State
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any>(null);

  // Editing functions
  const handleEditSection = (section: string) => {
    setEditingSection(section);
    setIsEditing(true);
    setEditedData(enhancedResume);
  };

  const handleSaveSection = async () => {
    if (!enhancedResume?.id || !editedData) return;

    try {
      await updateResumeMutation.mutateAsync({
        resumeId: enhancedResume.id,
        data: editedData
      });
      
      toast.success('Resume updated successfully!');
      setIsEditing(false);
      setEditingSection(null);
      setEditedData(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update resume. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSection(null);
    setEditedData(null);
  };

  const handleDataChange = (field: string, value: any) => {
    if (!editedData) return;
    
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Download as PDF
  const handleDownloadPDF = async () => {
    if (!enhancedResume) return;

    setIsDownloading(true);
    
    try {
      await downloadResumeAsPDF(enhancedResume, job?.title);
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download resume. Please try refreshing the page and downloading again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="svg-spinners:6-dots-rotate" width="40" height="40" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading enhanced resume...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !enhancedResume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon icon="lucide:file-x" width="48" height="48" className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Enhanced Resume Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            No enhanced resume found for this job. Please upload your resume to get started.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push(`/applicant/resume/upload/${jobId}`)}
              className="bg-brand text-white rounded-full py-2 px-6 font-semibold hover:bg-brand2 transition-colors"
            >
              Upload Resume
            </button>
            <button
              onClick={() => router.back()}
              className="border border-gray-300 text-gray-700 rounded-full py-2 px-6 font-semibold hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <Icon icon="lucide:arrow-left" className="h-4 w-4" />
              Back
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Enhanced Resume
              </h1>
              {job && (
                <p className="text-sm text-gray-600">
                  Optimized for {job.title} at {job.company?.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveSection}
                  disabled={updateResumeMutation.isPending}
                  className="flex items-center gap-2 bg-green-600 text-white rounded-full py-2 px-4 font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {updateResumeMutation.isPending ? (
                    <>
                      <Icon icon="svg-spinners:6-dots-rotate" className="h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:save" className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-full py-2 px-4 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Icon icon="lucide:x" className="h-4 w-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 border border-brand text-brand rounded-full py-2 px-4 font-semibold hover:bg-brand hover:text-white transition-colors"
                >
                  <Icon icon="lucide:edit" className="h-4 w-4" />
                  Edit Resume
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex items-center gap-2 bg-brand text-white rounded-full py-2 px-4 font-semibold hover:bg-brand2 disabled:bg-gray-400 transition-colors"
                >
                  {isDownloading ? (
                    <>
                      <Icon icon="svg-spinners:6-dots-rotate" className="h-4 w-4" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:download" className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div 
          ref={resumeRef}
          data-resume-content
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12"
          style={{ minHeight: '297mm' }} // A4 height
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {isEditing && editingSection === 'basic' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editedData?.full_name || ''}
                        onChange={(e) => handleDataChange('full_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editedData?.email || ''}
                          onChange={(e) => handleDataChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={editedData?.phone || ''}
                          onChange={(e) => handleDataChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {enhancedResume.full_name}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-gray-600">
                      {enhancedResume.email && (
                        <div className="flex items-center gap-1">
                          <Icon icon="lucide:mail" className="h-4 w-4" />
                          {enhancedResume.email}
                        </div>
                      )}
                      {enhancedResume.phone && (
                        <div className="flex items-center gap-1">
                          <Icon icon="lucide:phone" className="h-4 w-4" />
                          {enhancedResume.phone}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => setEditingSection(editingSection === 'basic' ? null : 'basic')}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon icon={editingSection === 'basic' ? 'lucide:x' : 'lucide:edit'} className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Summary */}
          {enhancedResume.summary && (
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
                  Professional Summary
                </h2>
                {isEditing && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'summary' ? null : 'summary')}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={editingSection === 'summary' ? 'lucide:x' : 'lucide:edit'} className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing && editingSection === 'summary' ? (
                <textarea
                  value={editedData?.summary || ''}
                  onChange={(e) => handleDataChange('summary', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Enter your professional summary..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {enhancedResume.summary}
                </p>
              )}
            </div>
          )}

          {/* Experience */}
          {enhancedResume.experience?.length > 0 && (
            <ExperienceSection
              experiences={enhancedResume.experience}
              isEditing={isEditing}
              onUpdate={(experiences) => handleDataChange('experience', experiences)}
            />
          )}

          {/* Skills */}
          {enhancedResume.skills && (
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
                  Skills
                </h2>
                {isEditing && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'skills' ? null : 'skills')}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={editingSection === 'skills' ? 'lucide:x' : 'lucide:edit'} className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing && editingSection === 'skills' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                    <textarea
                      value={editedData?.skills?.technical?.join(', ') || ''}
                      onChange={(e) => {
                        const newSkills = { ...editedData.skills };
                        newSkills.technical = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        handleDataChange('skills', newSkills);
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="JavaScript, React, Node.js, Python, AWS..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills</label>
                    <textarea
                      value={editedData?.skills?.soft_skills?.join(', ') || ''}
                      onChange={(e) => {
                        const newSkills = { ...editedData.skills };
                        newSkills.soft_skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        handleDataChange('skills', newSkills);
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="Leadership, Communication, Problem Solving, Team Management..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tools & Technologies</label>
                    <textarea
                      value={editedData?.skills?.tools?.join(', ') || ''}
                      onChange={(e) => {
                        const newSkills = { ...editedData.skills };
                        newSkills.tools = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        handleDataChange('skills', newSkills);
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="Docker, Git, Jenkins, Kubernetes, VS Code..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Technical Skills */}
                  {!Array.isArray(enhancedResume.skills) && (enhancedResume.skills as any).technical && (enhancedResume.skills as any).technical.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Technical Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(enhancedResume.skills as any).technical.map((skill: string, index: number) => (
                          <span 
                            key={index}
                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Soft Skills */}
                  {!Array.isArray(enhancedResume.skills) && (enhancedResume.skills as any).soft_skills && (enhancedResume.skills as any).soft_skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Soft Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(enhancedResume.skills as any).soft_skills.map((skill: string, index: number) => (
                          <span 
                            key={index}
                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tools */}
                  {!Array.isArray(enhancedResume.skills) && (enhancedResume.skills as any).tools && (enhancedResume.skills as any).tools.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Tools & Technologies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(enhancedResume.skills as any).tools.map((tool: string, index: number) => (
                          <span 
                            key={index}
                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback for simple array format */}
                  {Array.isArray(enhancedResume.skills) && enhancedResume.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {enhancedResume.skills.map((skill: string, index: number) => (
                          <span 
                            key={index}
                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Education */}
          {enhancedResume.education?.length > 0 && (
            <EducationSection
              education={enhancedResume.education}
              isEditing={isEditing}
              onUpdate={(education) => handleDataChange('education', education)}
            />
          )}

          {/* Certifications */}
          {enhancedResume.certifications && enhancedResume.certifications.length > 0 && (
            <CertificationSection
              certifications={enhancedResume.certifications}
              isEditing={isEditing}
              onUpdate={(certifications) => handleDataChange('certifications', certifications)}
            />
          )}

          {/* Projects */}
          {enhancedResume.projects && enhancedResume.projects.length > 0 && (
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
                  Projects
                </h2>
                {isEditing && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'projects' ? null : 'projects')}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={editingSection === 'projects' ? 'lucide:x' : 'lucide:edit'} className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing && editingSection === 'projects' ? (
                <div className="space-y-4">
                  {editedData?.projects?.map((project: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                          <input
                            type="text"
                            value={project.name || ''}
                            onChange={(e) => {
                              const newProjects = [...editedData.projects];
                              newProjects[index].name = e.target.value;
                              handleDataChange('projects', newProjects);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                          <input
                            type="text"
                            value={project.technologies?.join(', ') || ''}
                            onChange={(e) => {
                              const newProjects = [...editedData.projects];
                              newProjects[index].technologies = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                              handleDataChange('projects', newProjects);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="React, Node.js, MongoDB..."
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={project.description || ''}
                          onChange={(e) => {
                            const newProjects = [...editedData.projects];
                            newProjects[index].description = e.target.value;
                            handleDataChange('projects', newProjects);
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={project.start_date || ''}
                            onChange={(e) => {
                              const newProjects = [...editedData.projects];
                              newProjects[index].start_date = e.target.value;
                              handleDataChange('projects', newProjects);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={project.end_date || ''}
                            onChange={(e) => {
                              const newProjects = [...editedData.projects];
                              newProjects[index].end_date = e.target.value;
                              handleDataChange('projects', newProjects);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                          <input
                            type="url"
                            value={project.url || ''}
                            onChange={(e) => {
                              const newProjects = [...editedData.projects];
                              newProjects[index].url = e.target.value;
                              handleDataChange('projects', newProjects);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {enhancedResume.projects?.map((project: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          {project.description && (
                            <p className="text-gray-700 mt-1">{project.description}</p>
                          )}
                          {project.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech: string, techIndex: number) => (
                                <span 
                                  key={techIndex}
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            {project.start_date && (
                              <span>{new Date(project.start_date).toLocaleDateString()}</span>
                            )}
                            {project.end_date && (
                              <span> - {new Date(project.end_date).toLocaleDateString()}</span>
                            )}
                            {project.url && (
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Icon icon="lucide:external-link" className="h-3 w-3" />
                                View Project
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Languages */}
          {enhancedResume.languages && enhancedResume.languages.length > 0 && (
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
                  Languages
                </h2>
                {isEditing && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'languages' ? null : 'languages')}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={editingSection === 'languages' ? 'lucide:x' : 'lucide:edit'} className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing && editingSection === 'languages' ? (
                <div className="space-y-3">
                  {editedData?.languages?.map((language: any, index: number) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={language.name || ''}
                          onChange={(e) => {
                            const newLanguages = [...editedData.languages];
                            newLanguages[index].name = e.target.value;
                            handleDataChange('languages', newLanguages);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          placeholder="Language name"
                        />
                      </div>
                      <div className="w-32">
                        <select
                          value={language.proficiency || ''}
                          onChange={(e) => {
                            const newLanguages = [...editedData.languages];
                            newLanguages[index].proficiency = e.target.value;
                            handleDataChange('languages', newLanguages);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="">Select Level</option>
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Basic">Basic</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enhancedResume.languages?.map((language: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{language.name}</span>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                        {language.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Awards */}
          {enhancedResume.awards && enhancedResume.awards.length > 0 && (
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
                  Awards & Recognition
                </h2>
                {isEditing && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'awards' ? null : 'awards')}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={editingSection === 'awards' ? 'lucide:x' : 'lucide:edit'} className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing && editingSection === 'awards' ? (
                <div className="space-y-4">
                  {editedData?.awards?.map((award: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Award Title</label>
                          <input
                            type="text"
                            value={award.title || ''}
                            onChange={(e) => {
                              const newAwards = [...editedData.awards];
                              newAwards[index].title = e.target.value;
                              handleDataChange('awards', newAwards);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                          <input
                            type="text"
                            value={award.issuer || ''}
                            onChange={(e) => {
                              const newAwards = [...editedData.awards];
                              newAwards[index].issuer = e.target.value;
                              handleDataChange('awards', newAwards);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            value={award.date || ''}
                            onChange={(e) => {
                              const newAwards = [...editedData.awards];
                              newAwards[index].date = e.target.value;
                              handleDataChange('awards', newAwards);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={award.description || ''}
                            onChange={(e) => {
                              const newAwards = [...editedData.awards];
                              newAwards[index].description = e.target.value;
                              handleDataChange('awards', newAwards);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {enhancedResume.awards?.map((award: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Icon icon="lucide:award" className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{award.title}</h3>
                        <p className="text-sm text-gray-600">{award.issuer}</p>
                        {award.description && (
                          <p className="text-sm text-gray-700 mt-1">{award.description}</p>
                        )}
                        {award.date && (
                          <p className="text-xs text-gray-500 mt-1">{new Date(award.date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Publications */}
          {enhancedResume.publications && enhancedResume.publications.length > 0 && (
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
                  Publications
                </h2>
                {isEditing && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'publications' ? null : 'publications')}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={editingSection === 'publications' ? 'lucide:x' : 'lucide:edit'} className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing && editingSection === 'publications' ? (
                <div className="space-y-4">
                  {editedData?.publications?.map((publication: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={publication.title || ''}
                          onChange={(e) => {
                            const newPublications = [...editedData.publications];
                            newPublications[index].title = e.target.value;
                            handleDataChange('publications', newPublications);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                          <input
                            type="text"
                            value={publication.publisher || ''}
                            onChange={(e) => {
                              const newPublications = [...editedData.publications];
                              newPublications[index].publisher = e.target.value;
                              handleDataChange('publications', newPublications);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
                          <input
                            type="date"
                            value={publication.publication_date || ''}
                            onChange={(e) => {
                              const newPublications = [...editedData.publications];
                              newPublications[index].publication_date = e.target.value;
                              handleDataChange('publications', newPublications);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Authors</label>
                          <input
                            type="text"
                            value={publication.authors?.join(', ') || ''}
                            onChange={(e) => {
                              const newPublications = [...editedData.publications];
                              newPublications[index].authors = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                              handleDataChange('publications', newPublications);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="Author 1, Author 2..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                          <input
                            type="url"
                            value={publication.url || ''}
                            onChange={(e) => {
                              const newPublications = [...editedData.publications];
                              newPublications[index].url = e.target.value;
                              handleDataChange('publications', newPublications);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {enhancedResume.publications?.map((publication: any, index: number) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{publication.title}</h3>
                      <p className="text-sm text-gray-600">{publication.publisher}</p>
                      {publication.authors?.length > 0 && (
                        <p className="text-sm text-gray-700 mt-1">
                          Authors: {publication.authors.join(', ')}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        {publication.publication_date && (
                          <span>{new Date(publication.publication_date).toLocaleDateString()}</span>
                        )}
                        {publication.url && (
                          <a 
                            href={publication.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Icon icon="lucide:external-link" className="h-3 w-3" />
                            View Publication
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Volunteer Experience */}
          {enhancedResume.volunteer_experience && enhancedResume.volunteer_experience.length > 0 && (
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-1 flex-1">
                  Volunteer Experience
                </h2>
                {isEditing && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'volunteer' ? null : 'volunteer')}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon={editingSection === 'volunteer' ? 'lucide:x' : 'lucide:edit'} className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing && editingSection === 'volunteer' ? (
                <div className="space-y-4">
                  {editedData?.volunteer_experience?.map((volunteer: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                          <input
                            type="text"
                            value={volunteer.organization || ''}
                            onChange={(e) => {
                              const newVolunteer = [...editedData.volunteer_experience];
                              newVolunteer[index].organization = e.target.value;
                              handleDataChange('volunteer_experience', newVolunteer);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <input
                            type="text"
                            value={volunteer.role || ''}
                            onChange={(e) => {
                              const newVolunteer = [...editedData.volunteer_experience];
                              newVolunteer[index].role = e.target.value;
                              handleDataChange('volunteer_experience', newVolunteer);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={volunteer.start_date || ''}
                            onChange={(e) => {
                              const newVolunteer = [...editedData.volunteer_experience];
                              newVolunteer[index].start_date = e.target.value;
                              handleDataChange('volunteer_experience', newVolunteer);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={volunteer.end_date || ''}
                            onChange={(e) => {
                              const newVolunteer = [...editedData.volunteer_experience];
                              newVolunteer[index].end_date = e.target.value;
                              handleDataChange('volunteer_experience', newVolunteer);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={volunteer.description || ''}
                          onChange={(e) => {
                            const newVolunteer = [...editedData.volunteer_experience];
                            newVolunteer[index].description = e.target.value;
                            handleDataChange('volunteer_experience', newVolunteer);
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {enhancedResume.volunteer_experience?.map((volunteer: any, index: number) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{volunteer.role}</h3>
                          <p className="text-gray-600">{volunteer.organization}</p>
                          {volunteer.description && (
                            <p className="text-gray-700 mt-1">{volunteer.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            {volunteer.start_date && (
                              <span>{new Date(volunteer.start_date).toLocaleDateString()}</span>
                            )}
                            {volunteer.end_date && (
                              <span> - {new Date(volunteer.end_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            Enhanced resume generated on {new Date(enhancedResume.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}