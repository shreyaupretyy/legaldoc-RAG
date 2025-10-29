import React from 'react';
import { Scale, Upload, Library } from 'lucide-react';

const Header = ({ onUploadClick, onDocumentsClick, documentCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-2.5 rounded-xl shadow-md">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                LegalDocRAG
              </h1>
              <p className="text-sm text-slate-500">AI Legal Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onDocumentsClick}
              className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl transition-all border border-slate-300 shadow-sm hover:shadow"
            >
              <Library className="w-4 h-4" />
              <div className="text-left hidden sm:block">
                <div className="text-xs text-slate-500">Documents</div>
                <div className="text-sm font-bold text-slate-900">{documentCount}</div>
              </div>
              <span className="sm:hidden font-bold">{documentCount}</span>
            </button>
            
            <button
              onClick={onUploadClick}
              className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload PDF</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;