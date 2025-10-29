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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-dark-500 rounded-2xl shadow-dark-lg max-w-lg w-full overflow-hidden transform transition-all border border-dark-300">
        <div className="bg-linear-to-r from-accent-600 via-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Legal Document</h2>
            <p className="text-purple-100 text-sm mt-1">Add a PDF to your knowledge base</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading && !success}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="border-2 border-dashed border-dark-300 rounded-xl p-12 text-center cursor-pointer hover:border-accent-500 hover:bg-accent-500/5 transition-all duration-300 group"
            >
              <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark-400/30 group-hover:bg-accent-500/20 transition-colors">
                <Upload className="w-10 h-10 text-accent-400 group-hover:text-accent-300" />
              </div>
              <p className="text-dark-100 mb-2 font-semibold text-lg">Click to upload PDF document</p>
              <p className="text-sm text-dark-200 mb-1">or drag and drop</p>
              <p className="text-xs text-dark-300">PDF files only, up to 50MB</p>
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
              <div className="flex items-start space-x-4 p-4 bg-dark-400/20 rounded-xl border-2 border-dark-300">
                <div className="bg-accent-600 rounded-lg p-3 shrink-0">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-50 truncate text-lg">{file.name}</p>
                  <p className="text-sm text-dark-200 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!uploading && !success && (
                  <button
                    onClick={() => setFile(null)}
                    className="text-dark-300 hover:text-red-400 shrink-0 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              {uploading && (
                <div className="space-y-3">
                  <div className="w-full bg-dark-400 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="bg-linear-to-r from-accent-500 to-purple-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-dark-100">
                    <Loader className="w-5 h-5 animate-spin text-accent-400" />
                    <p className="text-sm font-medium">
                      {progress < 100 ? `Uploading... ${progress}%` : 'Processing document...'}
                    </p>
                  </div>
                  <p className="text-xs text-center text-dark-200">
                    This may take a moment for large documents
                  </p>
                </div>
              )}

              {success && uploadResult && (
                <div className="bg-success/10 border-2 border-success/30 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-7 h-7 text-success" />
                    <div>
                      <p className="font-bold text-success text-lg">Upload Successful!</p>
                      <p className="text-sm text-success/80">Document indexed and ready to use</p>
                    </div>
                  </div>
                  <div className="bg-dark-400/30 rounded-lg p-3 mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-200">Document ID:</span>
                      <span className="font-mono font-semibold text-dark-50">{uploadResult.doc_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-200">Chunks Created:</span>
                      <span className="font-semibold text-dark-50">{uploadResult.chunks_created}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start space-x-3 text-error p-4 bg-error/10 rounded-xl border-2 border-error/30">
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Upload Failed</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {!uploading && !success && (
                <button
                  onClick={handleUpload}
                  className="w-full bg-linear-to-r from-accent-600 to-purple-600 hover:from-accent-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-dark-lg hover:shadow-dark-lg transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload and Index Document</span>
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