import React from 'react';
import DocumentListModal from './DocumentListModal';

// This component serves as a wrapper that uses the DocumentListModal
const DocumentList = ({ documents, onClose, onRefresh }) => {
  return (
    <DocumentListModal 
      documents={documents}
      onClose={onClose}
      onRefresh={onRefresh}
    />
  );
};

export default DocumentList;