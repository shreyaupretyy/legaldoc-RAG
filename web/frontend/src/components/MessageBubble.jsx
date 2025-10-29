import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

const MessageBubble = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-slide-up`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-3xl group`}>
        <div className={`shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transform transition-transform group-hover:scale-110 ${
            isUser 
              ? 'bg-gradient-to-br from-teal-500 to-emerald-500' 
              : 'bg-gradient-to-br from-slate-600 to-slate-700'
          }`}>
            {isUser ? (
              <User className="w-6 h-6 text-white" />
            ) : (
              <Bot className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
        
        <div className={`px-5 py-4 rounded-2xl shadow-md transition-all duration-200 ${
          isUser 
            ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white' 
            : 'bg-white text-slate-900 border border-slate-200 hover:border-teal-300 hover:shadow-lg'
        }`}>
          {isUser ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">{message}</p>
          ) : (
            <div className="markdown-content prose prose-slate prose-base max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  // Inline code
                  code: ({node, inline, className, children, ...props}) => {
                    if (inline) {
                      return (
                        <code className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 font-mono text-sm border border-emerald-200" {...props}>
                          {children}
                        </code>
                      );
                    }
                    // Block code is handled by rehype-highlight
                    return <code className={className} {...props}>{children}</code>;
                  },
                  // Pre blocks (for code blocks)
                  pre: ({node, ...props}) => <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto my-3 border border-slate-700" {...props} />,
                  // Headings
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mb-3 mt-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-900 mb-2 mt-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-800 mb-2 mt-2" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-base font-semibold text-slate-700 mb-1 mt-2" {...props} />,
                  // Paragraphs
                  p: ({node, ...props}) => <p className="text-slate-700 mb-3 leading-relaxed" {...props} />,
                  // Lists
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-slate-700" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-700" {...props} />,
                  li: ({node, ...props}) => <li className="text-slate-700 ml-2" {...props} />,
                  // Links
                  a: ({node, ...props}) => <a className="text-teal-600 hover:text-teal-700 underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                  // Blockquotes
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-teal-500 pl-4 italic text-slate-600 my-3 bg-teal-50 py-2 rounded-r" {...props} />,
                  // Tables
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border-collapse border border-slate-300 rounded-lg overflow-hidden" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                  th: ({node, ...props}) => <th className="border border-slate-300 px-3 py-2 text-left text-slate-900 font-semibold" {...props} />,
                  td: ({node, ...props}) => <td className="border border-slate-300 px-3 py-2 text-slate-700" {...props} />,
                  // Horizontal Rule
                  hr: ({node, ...props}) => <hr className="border-slate-300 my-4" {...props} />,
                  // Strong/Bold
                  strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                  // Emphasis/Italic
                  em: ({node, ...props}) => <em className="italic text-slate-700" {...props} />,
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;