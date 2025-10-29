import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import { documentAPI, healthAPI } from './services/api';
import { Loader, AlertCircle } from 'lucide-react';

function App() {
  const [showUpload, setShowUpload] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await healthAPI.check();
      await loadDocuments();
    } catch (err) {
      setError('Failed to connect to backend. Please ensure the server is running.');
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await documentAPI.getDocuments();
      console.log('Documents loaded:', data);
      setDocuments(data.documents || []);
      return data.documents || [];
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
      return [];
    }
  };

  const handleUploadSuccess = async (result) => {
    console.log('Upload successful, reloading documents...', result);
    
    // Force reload documents
    const updatedDocs = await loadDocuments();
    console.log('Documents after upload:', updatedDocs);
    
    // Force chat interface to refresh
    setChatKey(prev => prev + 1);
    
    // Close upload modal
    setShowUpload(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-semibold text-lg">Loading LegalDocRAG...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="shrink-0 w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center border border-red-200">
                <AlertCircle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Connection Error</h2>
                <p className="text-sm text-slate-600">Unable to reach backend</p>
              </div>
            </div>
            <p className="text-slate-700 mb-6 text-base leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasDocuments = documents.length > 0;

  console.log('App render - hasDocuments:', hasDocuments, 'documents:', documents);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header 
        onUploadClick={() => setShowUpload(true)}
        onDocumentsClick={() => setShowDocuments(true)}
        documentCount={documents.length}
      />
      
      <main className="flex-1 overflow-hidden">
        <ChatInterface 
          key={chatKey} 
          hasDocuments={hasDocuments}
        />
      </main>

      {showUpload && (
        <DocumentUpload
          onClose={() => setShowUpload(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {showDocuments && (
        <DocumentList
          documents={documents}
          onClose={() => setShowDocuments(false)}
          onRefresh={loadDocuments}
        />
      )}
    </div>
  );
}

export default App;