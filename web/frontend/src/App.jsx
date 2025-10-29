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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-dark-600 to-dark-700">
        <div className="text-center">
          <Loader className="w-12 h-12 text-accent-600 animate-spin mx-auto mb-4" />
          <p className="text-dark-100 font-medium">Loading LegalDocRAG...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-dark-600 to-dark-700 p-4">
        <div className="bg-dark-500 rounded-2xl shadow-dark-lg p-8 max-w-md w-full border border-dark-300">
          <div className="flex items-center space-x-3 text-red-400 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold text-dark-50">Connection Error</h2>
          </div>
          <p className="text-dark-100 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-accent-600 hover:bg-accent-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasDocuments = documents.length > 0;

  console.log('App render - hasDocuments:', hasDocuments, 'documents:', documents);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-dark-600 via-dark-500 to-dark-700">
      <Header 
        onUploadClick={() => setShowUpload(true)}
        onDocumentsClick={() => setShowDocuments(true)}
        documentCount={documents.length}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)]">
          <ChatInterface 
            key={chatKey} 
            hasDocuments={hasDocuments}
          />
        </div>
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