import { FieldPluginData, FieldPluginActions } from '@storyblok/field-plugin';
import { FunctionComponent, useState, ChangeEvent } from 'react';
import { MenuResponse, MenuItem } from './types';

type Props = {
  data: FieldPluginData<MenuResponse>;
  actions: FieldPluginActions<MenuResponse>;
};

const PDFMenuConversion: FunctionComponent<Props> = ({ data, actions }) => {
  // 1) Drive everything off of this single state
  const [editableResult, setEditableResult] = useState<MenuResponse | null>(
    data.content ?? null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
    setResult(null);
  };

  const handleConvertAndSend = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch(
          'http://127.0.0.1:5001/spoonacular-storyblok-project/us-central1/analyzeFile',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: reader.result,
              fileName: selectedFile.name,
              fileType: selectedFile.type,
            }),
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // json.result is now already a JS object
        if (json.result) {
          setEditableResult(json.result);        // update local state
          actions.setContent(json.result);       // sync to Storyblok
          actions.setModalOpen(true);            // open the editor
        } else {
          setResult('Invalid response structure.');
        }
      } catch (err) {
        console.error('Upload failed:', err);
        setResult('Error uploading or analyzing file.');
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };


  const handleEdit = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof MenuItem,
    value: string
  ) => {
    if (!editableResult) return;
    const updated = structuredClone(editableResult);
    const item = updated.menu[sectionIndex].items[itemIndex];
    if (field === 'price') item.price = parseFloat(value) || 0;
    else item[field] = value;
    setEditableResult(updated);
    actions.setContent(updated); // live update
  };

  const handleSectionNameEdit = (sectionIndex: number, value: string) => {
    if (!editableResult) return;
    const updated = structuredClone(editableResult);
    updated.menu[sectionIndex].section = value;
    setEditableResult(updated);
    actions.setContent(updated); // live update
  };

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleDeleteContent = () => {
    setEditableResult(null);
    // actions.setContent(null);
  };

  const openModalToEdit = () => {
    if (editableResult) actions.setModalOpen(true);
  };

  console.log('data.content', data.content);


  return (
    <div className="w-full p-6 space-y-6">
      {data.content?.menu.length <= 0 && !data.isModalOpen && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Upload Your Menu</h2>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="
                flex-grow border-2 border-teal-500 rounded-full
                px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300
              "
            />
            <button
              onClick={handleConvertAndSend}
              disabled={isLoading}
              className="
                bg-teal-500 hover:bg-teal-600 text-white font-semibold
                px-4 py-2 rounded-full transition
              "
            >
              {isLoading ? 'Analyzing...' : 'Upload'}
            </button>
          </div>
          {result && (
            <pre className="bg-gray-100 p-3 rounded text-sm text-gray-700">
              {result}
            </pre>
          )}
        </div>
      )}

      {/* EDIT / DELETE CTA */}
      {data.content?.menu.length > 0 && !data.isModalOpen && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Menu Loaded</h2>
          <button
            onClick={openModalToEdit}
            className="
              w-full bg-teal-500 hover:bg-teal-600 text-white
              font-semibold py-2 rounded-full transition
            "
          >
            Edit Menu Content
          </button>
          <button
            onClick={handleDeleteContent}
            className="
              w-full border-2 border-teal-500 text-teal-500
              font-semibold py-2 rounded-full hover:bg-teal-50 transition
            "
          >
            Delete Menu Content
          </button>
        </div>
      )}

      {/* MODAL */}
      {data.isModalOpen && editableResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 bg-white shadow-lg rounded-lg">
            {/* Header */}
            <h2 className="text-2xl font-semibold text-gray-900">Edit Menu Content</h2>

            {/* Sections */}
            <div className="space-y-4">
              {editableResult.menu.map((sec, si) => (
                <div key={si} className="border border-gray-200 rounded-md bg-gray-50">
                  {/* Section Toggle */}
                  <button
                    onClick={() => toggleSection(si)}
                    className="w-full flex justify-between items-center px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-t-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <span>{sec.section || 'Untitled Section'}</span>
                    <span>{openSections[si] ? '▲' : '▼'}</span>
                  </button>

                  {/* Section Content */}
                  {openSections[si] && (
                    <div className="p-4 space-y-4 bg-white border-t border-gray-200">
                      {/* Section Name */}
                      <input
                        type="text"
                        value={sec.section}
                        onChange={(e) => handleSectionNameEdit(si, e.target.value)}
                        placeholder="Section Name"
                        className="
                      w-full
                      border border-gray-300 rounded px-4 py-2
                      focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500
                    "
                      />

                      {/* Items */}
                      {sec.items.map((it, ii) => (
                        <div
                          key={ii}
                          className="
                        space-y-2 border border-gray-200 p-4 rounded-md bg-gray-50
                      "
                        >
                          <input
                            type="text"
                            value={it.name}
                            onChange={(e) => handleEdit(si, ii, 'name', e.target.value)}
                            placeholder="Item Name"
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
                          />

                          <input
                            type="number"
                            step="0.01"
                            value={it.price}
                            onChange={(e) => handleEdit(si, ii, 'price', e.target.value)}
                            placeholder="Price"
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
                          />

                          <textarea
                            value={it.description || ''}
                            onChange={(e) => handleEdit(si, ii, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 resize-none"
                            rows={3}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => actions.setModalOpen(false)}
                className="
              bg-purple-600 hover:bg-purple-700 text-white font-semibold
              px-4 py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-purple-300
            "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFMenuConversion;
