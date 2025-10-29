import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';

const SourceCitation = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200 group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-slate-900 block">
              {sources.length} Source{sources.length > 1 ? 's' : ''} Referenced
            </span>
            <span className="text-xs text-slate-500">Click to {isExpanded ? 'collapse' : 'expand'}</span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-500 group-hover:text-teal-500 transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-teal-500 transition-colors" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-5 py-4 space-y-3 border-t border-slate-200 bg-slate-50/50 animate-slide-down">
          {sources.map((source, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition-all duration-200 hover:shadow-md group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md">
                      <FileText className="w-3 h-3" />
                      Page {source.page_number}
                    </span>
                    <span className="text-xs text-slate-600 font-medium px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                      {source.metadata.filename}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-200">
                    {source.text}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 w-24">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${source.score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600 font-medium">
                    {(source.score * 100).toFixed(1)}% match
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourceCitation;