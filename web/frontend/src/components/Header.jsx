import React from 'react';
import { Scale, Upload, FileText, Library } from 'lucide-react';

const Header = ({ onUploadClick, onDocumentsClick, documentCount }) => {
  return (
    <header className="bg-dark-500 shadow-dark-lg border-b border-dark-300 sticky top-0 z-40 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-linear-to-br from-violet-900 to-indigo-600 p-3 rounded-xl shadow-dark">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-violet-800 to-indigo-400 bg-clip-text text-transparent">
                LegalDocRAG
              </h1>
              <p className="text-sm text-dark-200">AI-Powered Legal Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onDocumentsClick}
              className="flex items-center space-x-2 bg-dark-400/30 hover:bg-dark-400/50 text-dark-100 px-4 py-2.5 rounded-lg transition-all duration-200 shadow-dark hover:shadow-dark-lg group border border-dark-300 hover:border-accent-500/30"
            >
              <Library className="w-5 h-5 text-dark-200 group-hover:text-accent-400 transition-colors" />
              <div className="text-left hidden sm:block">
                <div className="text-xs text-dark-200">Documents</div>
                <div className="text-sm font-bold text-dark-50">{documentCount}</div>
              </div>
              <span className="sm:hidden font-semibold">{documentCount}</span>
            </button>
            
            <button
              onClick={onUploadClick}
              className="flex items-center space-x-2 bg-linear-to-r from-violet-900 to-purple-600 hover:from-accent-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-dark hover:shadow-dark-lg transform hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              <span className="font-semibold hidden sm:inline">Upload PDF</span>
              <span className="font-semibold sm:hidden">Upload</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;