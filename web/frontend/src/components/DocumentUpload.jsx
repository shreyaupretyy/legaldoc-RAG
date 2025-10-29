import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { documentAPI } from '../services/api';

const DocumentUpload = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setSuccess(false);
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await documentAPI.uploadDocument(file, (percent) => {
        setProgress(percent);
      });

      console.log('Upload successful:', result);
      setSuccess(true);
      setUploadResult(result);
      setProgress(100);
      
      // Wait a bit then call success callback
      setTimeout(() => {
        onUploadSuccess(result);
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload document. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all border border-slate-200 animate-scale-in">
        <div className="relative bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 px-6 py-6 flex items-center justify-between overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload Document
            </h2>
            <p className="text-teal-50 text-sm mt-1">Add a PDF to your knowledge base</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading && !success}
            className="relative z-10 text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:rotate-90 transform"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="group border-2 border-dashed border-slate-300 hover:border-teal-400 rounded-2xl p-12 text-center cursor-pointer hover:bg-teal-50 transition-all duration-300"
            >
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Upload className="w-12 h-12 text-white" />
                </div>
              </div>
              <p className="text-slate-900 mb-2 font-bold text-lg">Click to upload PDF document</p>
              <p className="text-sm text-slate-600 mb-1">or drag and drop</p>
              <p className="text-xs text-slate-500">PDF files only, up to 50MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
                <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl p-3 shrink-0 shadow-md">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate text-lg">{file.name}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!uploading && !success && (
                  <button
                    onClick={() => setFile(null)}
                    className="text-slate-500 hover:text-red-500 shrink-0 transition-colors p-2 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {uploading && (
                <div className="space-y-3 animate-slide-up">
                  <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <Loader className="w-5 h-5 animate-spin text-teal-500" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-900">
                        {progress < 100 ? `Uploading... ${progress}%` : 'Processing document...'}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        This may take a moment for large documents
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {success && uploadResult && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6 animate-scale-in">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-300">
                      <CheckCircle className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-700 text-lg">Upload Successful!</p>
                      <p className="text-sm text-emerald-600">Document indexed and ready to use</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 space-y-2 text-sm border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Document ID:</span>
                      <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded">{uploadResult.doc_id}</span>
                    </div>
                    <div className="h-px bg-slate-200"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Chunks Created:</span>
                      <span className="font-bold text-slate-900">{uploadResult.chunks_created}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start space-x-3 text-red-700 p-5 bg-red-50 rounded-xl border-2 border-red-200 animate-slide-up">
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-lg">Upload Failed</p>
                    <p className="text-sm mt-1 text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {!uploading && !success && (
                <button
                  onClick={handleUpload}
                  className="group relative w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Upload className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Upload and Index Document</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;