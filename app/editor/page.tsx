'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  EditableElement,
  PageState,
  savePageState,
  loadPageState,
  applyElementChanges,
  extractElementData,
  rgbToHex,
} from '@/lib/editor-utils';

export default function EditorPage() {
  const router = useRouter();
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [elements, setElements] = useState<EditableElement[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    // Load saved state
    const savedState = loadPageState();
    if (savedState) {
      setElements(savedState.elements);
      // Apply saved changes to demo page
      savedState.elements.forEach(applyElementChanges);
    }
  }, []);

  useEffect(() => {
    if (!isEditorMode) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ignore clicks on editor UI
      if (target.closest('.editor-ui')) {
        return;
      }

      // Check if element is editable
      if (target.closest('.editable-element')) {
        e.preventDefault();
        e.stopPropagation();
        
        const element = target.closest('.editable-element') as HTMLElement;
        const type = element.getAttribute('data-type') as EditableElement['type'];
        
        if (type) {
          const elementData = extractElementData(element, type);
          setSelectedElement(elementData);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isEditorMode]);

  const handleContentChange = (content: string) => {
    if (!selectedElement) return;

    const updated = { ...selectedElement, content };
    setSelectedElement(updated);
    updateElement(updated);
  };

  const handleStyleChange = (property: string, value: string) => {
    if (!selectedElement) return;

    const updated = {
      ...selectedElement,
      styles: { ...selectedElement.styles, [property]: value },
    };
    setSelectedElement(updated);
    updateElement(updated);
  };

  const handleAttributeChange = (property: string, value: string) => {
    if (!selectedElement) return;

    const updated = {
      ...selectedElement,
      attributes: { ...selectedElement.attributes, [property]: value },
    };
    setSelectedElement(updated);
    updateElement(updated);
  };

  const updateElement = (element: EditableElement) => {
    // Apply changes to DOM
    applyElementChanges(element);

    // Update state
    setElements(prev => {
      const index = prev.findIndex(el => el.id === element.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = element;
        return updated;
      } else {
        return [...prev, element];
      }
    });

    // Save to localStorage
    const newState: PageState = {
      elements: elements.map(el => el.id === element.id ? element : el),
      history: [],
      currentIndex: 0,
    };
    if (newState.elements.findIndex(el => el.id === element.id) < 0) {
      newState.elements.push(element);
    }
    savePageState(newState);
  };

  const toggleEditorMode = () => {
    setIsEditorMode(!isEditorMode);
    if (isEditorMode) {
      setSelectedElement(null);
    }
  };

  const resetChanges = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      localStorage.removeItem('pageEditorState');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editor Toolbar */}
      <div className="editor-ui fixed top-0 left-0 right-0 bg-white shadow-lg z-50 border-b-2 border-blue-500">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Home
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Visual Page Editor</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showSidebar ? 'Hide' : 'Show'} Sidebar
              </button>
              <button
                onClick={toggleEditorMode}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isEditorMode
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isEditorMode ? 'Exit Editor Mode' : 'Enable Editor Mode'}
              </button>
              <button
                onClick={resetChanges}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          {isEditorMode && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Editor Mode Active:</strong> Click on any highlighted element to edit its content, styles, and attributes.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex pt-20">
        {/* Sidebar */}
        {showSidebar && (
          <div className="editor-ui w-96 bg-white border-r border-gray-200 h-screen overflow-y-auto fixed left-0 shadow-lg">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Element Properties</h2>

              {selectedElement ? (
                <div className="space-y-6">
                  {/* Element Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Element Type
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900 capitalize">
                      {selectedElement.type}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={selectedElement.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={rgbToHex(selectedElement.styles?.color || '#000000')}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElement.styles?.color || ''}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  {(selectedElement.type === 'button') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={rgbToHex(selectedElement.styles?.backgroundColor || '#000000')}
                          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElement.styles?.backgroundColor || ''}
                          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  )}

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <input
                      type="text"
                      value={selectedElement.styles?.fontSize || ''}
                      onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="16px"
                    />
                  </div>

                  {/* Link Attributes */}
                  {(selectedElement.type === 'button' || selectedElement.type === 'link') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Link URL
                        </label>
                        <input
                          type="text"
                          value={selectedElement.attributes?.href || ''}
                          onChange={(e) => handleAttributeChange('href', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Open In
                        </label>
                        <select
                          value={selectedElement.attributes?.target || '_self'}
                          onChange={(e) => handleAttributeChange('target', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="_self">Same Tab</option>
                          <option value="_blank">New Tab</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Selector Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CSS Selector
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-mono text-gray-700 break-all">
                      {selectedElement.selector}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="text-gray-500">
                    {isEditorMode 
                      ? 'Click an element on the page to edit it'
                      : 'Enable editor mode to start editing'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Demo Page Content */}
        <div className={`flex-1 ${showSidebar ? 'ml-96' : ''} transition-all duration-300`}>
          <DemoPage isEditorMode={isEditorMode} />
        </div>
      </div>
    </div>
  );
}

// Demo Page Component
function DemoPage({ isEditorMode }: { isEditorMode: boolean }) {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1
            className={`text-5xl font-bold mb-6 ${isEditorMode ? 'editable-element' : ''}`}
            data-type="headline"
          >
            Welcome to Our Amazing Product
          </h1>
          <p
            className={`text-xl mb-8 ${isEditorMode ? 'editable-element' : ''}`}
            data-type="subheadline"
          >
            Transform your business with our innovative solution
          </p>
          <a
            href="#"
            className={`inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors ${
              isEditorMode ? 'editable-element' : ''
            }`}
            data-type="button"
          >
            Get Started Now
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2
            className={`text-4xl font-bold text-center mb-12 text-gray-900 ${isEditorMode ? 'editable-element' : ''}`}
            data-type="headline"
          >
            Why Choose Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <h3
                className={`text-2xl font-bold mb-4 text-gray-900 ${isEditorMode ? 'editable-element' : ''}`}
                data-type="subheadline"
              >
                Fast & Reliable
              </h3>
              <p
                className={`text-gray-600 ${isEditorMode ? 'editable-element' : ''}`}
                data-type="body"
              >
                Our platform delivers lightning-fast performance with 99.9% uptime guarantee.
              </p>
            </div>
            
            <div className="text-center p-6">
              <h3
                className={`text-2xl font-bold mb-4 text-gray-900 ${isEditorMode ? 'editable-element' : ''}`}
                data-type="subheadline"
              >
                Easy to Use
              </h3>
              <p
                className={`text-gray-600 ${isEditorMode ? 'editable-element' : ''}`}
                data-type="body"
              >
                Intuitive interface designed for both beginners and professionals.
              </p>
            </div>
            
            <div className="text-center p-6">
              <h3
                className={`text-2xl font-bold mb-4 text-gray-900 ${isEditorMode ? 'editable-element' : ''}`}
                data-type="subheadline"
              >
                24/7 Support
              </h3>
              <p
                className={`text-gray-600 ${isEditorMode ? 'editable-element' : ''}`}
                data-type="body"
              >
                Our dedicated team is always here to help you succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-20 px-4">
        <div className="container mx-auto text-center">
          <h2
            className={`text-4xl font-bold mb-6 text-gray-900 ${isEditorMode ? 'editable-element' : ''}`}
            data-type="headline"
          >
            Ready to Get Started?
          </h2>
          <p
            className={`text-xl mb-8 text-gray-600 ${isEditorMode ? 'editable-element' : ''}`}
            data-type="body"
          >
            Join thousands of satisfied customers today
          </p>
          <a
            href="#"
            className={`inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors ${
              isEditorMode ? 'editable-element' : ''
            }`}
            data-type="button"
          >
            Start Free Trial
          </a>
        </div>
      </section>
    </div>
  );
}

