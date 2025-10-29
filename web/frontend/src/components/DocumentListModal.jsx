import React from 'react';
import { X, FileText, Trash2, RefreshCw } from 'lucide-react';

const DocumentListModal = ({ documents, onClose, onRefresh }) => {
  const formatFileSize = (size) => {
    if (!size) return 'Unknown size';
    const mb = size / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-dark-500 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-dark-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-600 via-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Indexed Documents</h2>
            <p className="text-purple-100 text-sm mt-1">
              {documents.length} document{documents.length !== 1 ? 's' : ''} in your knowledge base
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-dark-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-dark-200" />
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">No Documents Found</h3>
              <p className="text-dark-200">Upload a PDF document to get started.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.doc_id}
                  className="flex items-start justify-between p-4 bg-dark-400/30 rounded-xl border border-dark-300 hover:border-accent-500/50 transition-all duration-200 hover:bg-dark-400/50"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="bg-accent-600 rounded-lg p-3 shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-dark-50 truncate text-lg">
                        {doc.filename}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-dark-200">
                        <span>ID: {doc.doc_id}</span>
                        <span>•</span>
                        <span>{doc.total_chunks || 0} chunks</span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 bg-accent-500/20 text-accent-300 text-xs font-medium rounded-full">
                          ✓ Indexed
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 
                  <button className="text-dark-300 hover:text-red-400 shrink-0 transition-colors ml-3">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentListModal;