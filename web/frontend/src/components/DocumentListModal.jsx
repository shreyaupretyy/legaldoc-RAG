import React from 'react';
import { X, FileText, Trash2, RefreshCw, Library, CheckCircle } from 'lucide-react';

const DocumentListModal = ({ documents, onClose, onRefresh }) => {
  const formatFileSize = (size) => {
    if (!size) return 'Unknown size';
    const mb = size / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-slate-200 animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 px-6 py-6 flex items-center justify-between overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Document Library</h2>
              <p className="text-teal-50 text-sm mt-1">
                {documents.length} document{documents.length !== 1 ? 's' : ''} indexed
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="text-white hover:bg-white/20 rounded-xl p-2.5 transition-all duration-200 hover:rotate-180 transform"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl p-2.5 transition-all duration-200 hover:rotate-90 transform"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-teal-500 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Documents Found</h3>
              <p className="text-slate-600">Upload a PDF document to get started with AI-powered analysis.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto chat-scrollbar pr-2">
              {documents.map((doc, index) => (
                <div
                  key={doc.doc_id}
                  className="group flex items-start justify-between p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-all duration-200 hover:shadow-md animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl p-3 shadow-md transform group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate text-lg group-hover:text-teal-600 transition-colors">
                        {doc.filename}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200">
                          <span className="text-xs">ID:</span>
                          <span className="font-mono text-xs">{doc.doc_id}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200">
                          <span className="text-xs">{doc.total_chunks || 0} chunks</span>
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">
                          <CheckCircle className="w-3 h-3" />
                          Indexed & Ready
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 
                  <button className="text-slate-500 hover:text-red-500 shrink-0 transition-colors ml-3 p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100">
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