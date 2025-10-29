import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';

const SourceCitation = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 bg-dark-400/20 border border-dark-300 rounded-lg overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-dark-400/30 transition-colors duration-200"
      >
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-accent-400" />
          <span className="font-semibold text-dark-100">
            {sources.length} Source{sources.length > 1 ? 's' : ''} Referenced
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-dark-200" />
        ) : (
          <ChevronDown className="w-5 h-5 text-dark-200" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 py-3 space-y-3 border-t border-dark-300 bg-dark-400/10">
          {sources.map((source, index) => (
            <div
              key={index}
              className="p-3 bg-dark-400/20 rounded-lg border border-dark-300 hover:border-accent-500/50 transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="inline-block px-2 py-1 bg-accent-600 text-white text-xs font-semibold rounded">
                      Page {source.page_number}
                    </span>
                    <span className="text-xs text-dark-200 font-medium">
                      {source.metadata.filename}
                    </span>
                  </div>
                  <p className="text-sm text-dark-100 leading-relaxed line-clamp-3">
                    {source.text}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-300">
                <span className="text-xs text-dark-200">
                  Relevance: {(source.score * 100).toFixed(1)}%
                </span>
                {/* <button className="text-xs text-accent-400 hover:text-accent-300 flex items-center space-x-1">
                  <span>View in PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourceCitation;