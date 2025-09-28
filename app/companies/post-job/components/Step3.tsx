'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { JobFormData } from './Multiform';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useAITailoredDescription } from '@/hooks/jobs/useCreateJob/useAiTailoredDescription';
import { toast } from 'sonner';

// TipTap imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Table } from '@tiptap/extension-table';
import { TextStyle } from '@tiptap/extension-text-style';

interface CreatedJob {
  id: number;
  title: string;
  status: string;
}

interface Step3Props {
  formData: JobFormData;
  updateFormData: (data: Partial<JobFormData>) => void;
  form: UseFormReturn<any>;
  createdJob?: CreatedJob | null;
}

type Step3Fields = {
  description: string;
  responsibilities: string;
  benefits: string;
};

// FIX 1: Create a singleton extension manager to prevent duplicate extensions
class ExtensionManager {
  private static instance: ExtensionManager;
  private extensionsMap: Map<string, any> = new Map();

  private constructor() {
    this.initializeExtensions();
  }

  public static getInstance(): ExtensionManager {
    if (!ExtensionManager.instance) {
      ExtensionManager.instance = new ExtensionManager();
    }
    return ExtensionManager.instance;
  }

  private initializeExtensions() {
    // Create base extensions only once
    const baseExtensions = [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand underline hover:text-blue-800',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ];

    baseExtensions.forEach(ext => {
      if (ext.name) {
        this.extensionsMap.set(ext.name, ext);
      }
    });
  }

  public getExtensions(placeholderText: string = 'Start typing...') {
    // Create a new array with the placeholder extension configured for this instance
    const placeholderExtension = Placeholder.configure({
      placeholder: placeholderText,
    });

    return [
      ...Array.from(this.extensionsMap.values()),
      placeholderExtension,
    ];
  }
}

// FIX 2: Create a custom hook for the editor to manage instances properly
const useRichTextEditor = (value: string, onChange: (value: string) => void, placeholder: string) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const extensionManager = ExtensionManager.getInstance();
  const extensions = extensionManager.getExtensions(placeholder);

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] p-4 text-gray-800 leading-relaxed',
      },
    },
    immediatelyRender: false,
    enableInputRules: true,
    enablePasteRules: true,
    injectCSS: true,
  }, [value, onChange, placeholder]);

  // Sync content when value changes
  useEffect(() => {
    if (editor && isMounted && value !== editor.getHTML()) {
      editor.commands.setContent(value, false as any);
    }
  }, [value, editor, isMounted]);

  return { editor, isMounted };
};

// FIX 3: Simplify the RichTextEditor component
const RichTextEditor = React.memo(({ 
  value, 
  onChange, 
  placeholder,
  error
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const { editor, isMounted } = useRichTextEditor(value, onChange, placeholder);

  // Memoize toolbar configuration
  const toolbarConfig = React.useMemo(() => {
    if (!editor) return null;

    const formatButtons = [
      { 
        command: () => editor.chain().focus().toggleBold().run(), 
        icon: 'ph:text-aa', 
        active: editor.isActive('bold'),
        tooltip: 'Bold (Ctrl+B)'
      },
      { 
        command: () => editor.chain().focus().toggleItalic().run(), 
        icon: 'ph:text-italic', 
        active: editor.isActive('italic'),
        tooltip: 'Italic (Ctrl+I)'
      },
      { 
        command: () => editor.chain().focus().toggleUnderline().run(), 
        icon: 'ph:text-underline', 
        active: editor.isActive('underline'),
        tooltip: 'Underline (Ctrl+U)'
      },
      { 
        command: () => editor.chain().focus().toggleStrike().run(), 
        icon: 'ph:text-strikethrough', 
        active: editor.isActive('strike'),
        tooltip: 'Strikethrough'
      },
    ];

    const headingButtons = [
      { 
        command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 
        icon: 'ph:text-h-one', 
        active: editor.isActive('heading', { level: 1 }),
        tooltip: 'Heading 1'
      },
      { 
        command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 
        icon: 'ph:text-h-two', 
        active: editor.isActive('heading', { level: 2 }),
        tooltip: 'Heading 2'
      },
      { 
        command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 
        icon: 'ph:text-h-three', 
        active: editor.isActive('heading', { level: 3 }),
        tooltip: 'Heading 3'
      },
      { 
        command: () => editor.chain().focus().setParagraph().run(), 
        icon: 'ph:paragraph', 
        active: editor.isActive('paragraph'),
        tooltip: 'Paragraph'
      },
    ];

    const alignButtons = [
      { 
        command: () => editor.chain().focus().setTextAlign('left').run(), 
        icon: 'ph:text-align-left', 
        active: editor.isActive({ textAlign: 'left' }),
        tooltip: 'Align Left'
      },
      { 
        command: () => editor.chain().focus().setTextAlign('center').run(), 
        icon: 'ph:text-align-center', 
        active: editor.isActive({ textAlign: 'center' }),
        tooltip: 'Align Center'
      },
      { 
        command: () => editor.chain().focus().setTextAlign('right').run(), 
        icon: 'ph:text-align-right', 
        active: editor.isActive({ textAlign: 'right' }),
        tooltip: 'Align Right'
      },
      { 
        command: () => editor.chain().focus().setTextAlign('justify').run(), 
        icon: 'ph:text-align-justify', 
        active: editor.isActive({ textAlign: 'justify' }),
        tooltip: 'Justify'
      },
    ];

    const listButtons = [
      { 
        command: () => editor.chain().focus().toggleBulletList().run(), 
        icon: 'ph:list-bullets', 
        active: editor.isActive('bulletList'),
        tooltip: 'Bullet List'
      },
      { 
        command: () => editor.chain().focus().toggleOrderedList().run(), 
        icon: 'ph:list-numbers', 
        active: editor.isActive('orderedList'),
        tooltip: 'Numbered List'
      },
    ];

    const utilityButtons = [
      { 
        command: () => editor.chain().focus().toggleBlockquote().run(), 
        icon: 'ph:quotes', 
        active: editor.isActive('blockquote'),
        tooltip: 'Quote'
      },
      { 
        command: () => editor.chain().focus().toggleCodeBlock().run(), 
        icon: 'ph:code-block', 
        active: editor.isActive('codeBlock'),
        tooltip: 'Code Block'
      },
      { 
        command: () => editor.chain().focus().setHorizontalRule().run(), 
        icon: 'ph:minus', 
        active: false,
        tooltip: 'Horizontal Rule'
      },
    ];

    return { formatButtons, headingButtons, alignButtons, listButtons, utilityButtons };
  }, [editor]);

  const colors = React.useMemo(() => [
    '#000000', '#374151', '#dc2626', '#ea580c', '#d97706', '#ca8a04',
    '#65a30d', '#16a34a', '#059669', '#0891b2', '#0284c7', '#2563eb',
    '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777', '#e11d48'
  ], []);

  const highlights = React.useMemo(() => [
    '#fef3c7', '#fde68a', '#fed7aa', '#fecaca', '#fbb6ce', '#ddd6fe',
    '#c7d2fe', '#bfdbfe', '#a7f3d0', '#bbf7d0', '#d1fae5', '#f3e8ff'
  ], []);

  const handleLinkClick = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setShowLinkDialog(true);
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const ToolbarButton = React.useCallback(({ button, className = "" }: { button: any, className?: string }) => (
    <button
      type="button"
      onClick={button.command}
      title={button.tooltip}
      className={`p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 ${
        button.active ? 'bg-blue-100 text-brand border border-blue-200 ' : 'text-gray-700'
      } ${className}`}
    >
      <Icon icon={button.icon} className="text-lg" />
    </button>
  ), []);

  // Show a simple textarea during SSR or until mounted
  if (!isMounted) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-lg border border-gray-300 p-4 
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50
                 transition-all duration-200 resize-vertical min-h-[200px]
                 text-base leading-relaxed"
      />
    );
  }

  // Don't render editor until it's fully ready
  if (!editor || !toolbarConfig) {
    return (
      <div className="min-h-[200px] border border-gray-300 rounded-lg p-4 bg-gray-50 animate-pulse">
        Loading editor...
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 focus-within:ring-opacity-50 transition-all duration-200 ${error ? 'border-red-500' : ''}`}>
      {/* Enhanced Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        {/* Row 1: Format and Headings */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {toolbarConfig.formatButtons.map((button, index) => (
            <ToolbarButton key={`format-${index}`} button={button} />
          ))}
          
          <div className="w-px h-7 bg-gray-300 mx-1" />
          
          {toolbarConfig.headingButtons.map((button, index) => (
            <ToolbarButton key={`heading-${index}`} button={button} />
          ))}
          
          <div className="w-px h-7 bg-gray-300 mx-1" />
          
          {/* Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700"
            >
              <Icon icon="ph:palette" className="text-lg" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 z-50 mt-1.5 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="grid grid-cols-6 gap-1.5 w-52">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-7 h-7 rounded-lg border border-gray-300 hover:scale-110 transition-transform duration-200 "
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Highlight Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              title="Highlight"
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700"
            >
              <Icon icon="ph:highlighter-circle" className="text-lg" />
            </button>
            {showHighlightPicker && (
              <div className="absolute top-full left-0 z-50 mt-1.5 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="grid grid-cols-4 gap-1.5 w-36">
                  {highlights.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color }).run();
                        setShowHighlightPicker(false);
                      }}
                      className="w-7 h-7 rounded-lg border border-gray-300 hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Alignment, Lists, and Utilities */}
        <div className="flex flex-wrap items-center gap-1.5">
          {toolbarConfig.alignButtons.map((button, index) => (
            <ToolbarButton key={`align-${index}`} button={button} />
          ))}
          
          <div className="w-px h-7 bg-gray-300 mx-1" />
          
          {toolbarConfig.listButtons.map((button, index) => (
            <ToolbarButton key={`list-${index}`} button={button} />
          ))}
          
          <div className="w-px h-7 bg-gray-300 mx-1" />
          
          {toolbarConfig.utilityButtons.map((button, index) => (
            <ToolbarButton key={`utility-${index}`} button={button} />
          ))}
          
          <div className="w-px h-7 bg-gray-300 mx-1" />
          
          {/* Link Button */}
          <button
            type="button"
            onClick={handleLinkClick}
            title="Add Link"
            className={`p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 ${
              editor.isActive('link') ? 'bg-blue-100 text-brand border border-blue-200 ' : 'text-gray-700'
            }`}
          >
            <Icon icon="ph:link" className="text-lg" />
          </button>
          
          {/* Table Button */}
          <button
            type="button"
            onClick={addTable}
            title="Insert Table"
            className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700"
          >
            <Icon icon="ph:table" className="text-lg" />
          </button>
          
          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear Formatting"
            className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700"
          >
            <Icon icon="ph:eraser" className="text-lg" />
          </button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-white rounded-b-lg">
        <EditorContent editor={editor} />
      </div>
      
      {/* Word Count */}
      <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 rounded-b-lg">
        <span>
          {editor.storage.characterCount?.characters() || 0} characters, {' '}
          {editor.storage.characterCount?.words() || 0} words
        </span>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 p-2 border-t border-gray-200 bg-red-50 rounded-b-lg">{error}</p>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg  min-w-[300px] md:min-w-[350px]">
            <h3 className="text-lg font-medium mb-3">Add Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={setLink}
                className="px-3 py-2 bg-brand text-white rounded hover:bg-brand2"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

const Step3: React.FC<Step3Props> = ({ formData, updateFormData, form, createdJob }) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const [isGenerating, setIsGenerating] = useState(false);
  
  const aiMutation = useAITailoredDescription();
  const watchedValues = watch();

  // Memoize the input change handler
  const handleInputChange = React.useCallback((field: keyof Step3Fields, value: string) => {
    updateFormData({ [field]: value });
    setValue(field, value);
  }, [updateFormData, setValue]);

  const handleAIGenerateAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!createdJob?.id) {
      toast.error('Job ID is required for AI generation');
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await aiMutation.mutateAsync({
        job_id: createdJob.id.toString(),
      });

      if (result.description) {
        handleInputChange('description', result.description);
      }
      if (result.responsibilities) {
        handleInputChange('responsibilities', result.responsibilities);
      }
      if (result.benefits) {
        handleInputChange('benefits', result.benefits);
      }

    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create separate field components
  const DescriptionField = (
    <div className="mb-8 last:mb-0">
      <label className="block text-base md:text-[17px] font-semibold text-gray-800 mb-3">
        Job Description
      </label>
      <RichTextEditor
        value={watchedValues?.description || ''}
        onChange={(value) => handleInputChange('description', value)}
        placeholder="Describe the job in detail, including overall purpose, key objectives, and what makes this role unique..."
        error={errors.description?.message as string}
      />
    </div>
  );

  const ResponsibilitiesField = (
    <div className="mb-8 last:mb-0">
      <label className="block text-base md:text-[17px] font-semibold text-gray-800 mb-3">
        Responsibilities
      </label>
      <RichTextEditor
        value={watchedValues?.responsibilities || ''}
        onChange={(value) => handleInputChange('responsibilities', value)}
        placeholder="List key responsibilities and daily tasks. Use bullet points for clarity..."
        error={errors.responsibilities?.message as string}
      />
    </div>
  );

  const BenefitsField = (
    <div className="mb-8 last:mb-0">
      <label className="block text-base md:text-[17px] font-semibold text-gray-800 mb-3">
        Benefits
      </label>
      <RichTextEditor
        value={watchedValues?.benefits || ''}
        onChange={(value) => handleInputChange('benefits', value)}
        placeholder="Describe benefits offered, perks, company culture, and what makes your company great to work for..."
        error={errors.benefits?.message as string}
      />
    </div>
  );

  return (
    <div id='step-3' className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-2 tracking-wider text-gray-800">
            Job Description
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Create a compelling job description using the rich text editor below
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleAIGenerateAll}
          disabled={isGenerating || aiMutation.isPending || !createdJob?.id}
          className="flex items-center gap-2 px-5 py-3 self-end mt-4 md:mt-0
                   text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                   bg-white "
        >
          {isGenerating || aiMutation.isPending ? (
            <>
              <Icon icon="eos-icons:loading" className="animate-spin text-lg" />
              <span className="font-medium">AI Generating...</span>
            </>
          ) : (
            <>
              <Icon icon="ph:magic-wand" className="text-xl" />
              <span className="font-medium">Generate with AI</span>
            </>
          )}
        </button>
      </div>
      
      <div className="space-y-8">
        {DescriptionField}
        {ResponsibilitiesField}
        {BenefitsField}
      </div>

      {/* AI Help Note */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon icon="ph:lightbulb" className="text-brand mt-0.5 flex-shrink-0 text-xl" />
          <div>
            <p className="text-base text-gray-700 leading-relaxed">
              <strong className="text-gray-800">AI Assistant:</strong> Click "Generate with AI" to automatically create a complete 
              job description, responsibilities, and benefits package tailored to your job title. 
              The AI will analyze your job details and generate professional, engaging content that you can customize using the rich text editor above.
            </p>
          </div>
        </div>
      </div>

      {(isGenerating || aiMutation.isPending) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3 text-brand">
            <Icon icon="eos-icons:loading" className="animate-spin text-lg" />
            <span className="text-sm font-medium">AI is generating tailored content for your job...</span>
          </div>
        </div>
      )}

      {aiMutation.isSuccess && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3 text-green-700">
            <Icon icon="ph:check-circle" className="text-lg" />
            <span className="text-sm font-medium">AI content generated successfully! Use the rich text editor to customize and enhance the content.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Step3);