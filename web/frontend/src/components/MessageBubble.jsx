import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

const MessageBubble = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-3xl`}>
        <div className={`shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isUser ? 'bg-accent-600' : 'bg-linear-to-br from-purple-600 to-indigo-600'
          }`}>
            {isUser ? (
              <User className="w-6 h-6 text-white" />
            ) : (
              <Bot className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
        
        <div className={`px-4 py-3 rounded-2xl shadow-dark ${
          isUser 
            ? 'bg-accent-600 text-white' 
            : 'bg-dark-400/30 text-dark-50 border border-dark-300 backdrop-blur-sm'
        }`}>
          {isUser ? (
            <p className="text-sm md:text-base whitespace-pre-wrap">{message}</p>
          ) : (
            <div className="markdown-content prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  // Inline code
                  code: ({node, inline, className, children, ...props}) => {
                    if (inline) {
                      return (
                        <code className="bg-dark-500/50 px-1.5 py-0.5 rounded text-accent-300 font-mono text-sm" {...props}>
                          {children}
                        </code>
                      );
                    }
                    // Block code is handled by rehype-highlight
                    return <code className={className} {...props}>{children}</code>;
                  },
                  // Pre blocks (for code blocks)
                  pre: ({node, ...props}) => <pre className="bg-dark-600 rounded-lg p-4 overflow-x-auto my-3" {...props} />,
                  // Headings
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-dark-50 mb-3 mt-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-dark-50 mb-2 mt-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-dark-50 mb-2 mt-2" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-base font-semibold text-dark-100 mb-1 mt-2" {...props} />,
                  // Paragraphs
                  p: ({node, ...props}) => <p className="text-dark-100 mb-3 leading-relaxed" {...props} />,
                  // Lists
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-dark-100" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-dark-100" {...props} />,
                  li: ({node, ...props}) => <li className="text-dark-100 ml-2" {...props} />,
                  // Links
                  a: ({node, ...props}) => <a className="text-accent-400 hover:text-accent-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  // Blockquotes
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent-500 pl-4 italic text-dark-200 my-3" {...props} />,
                  // Tables
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border-collapse border border-dark-300" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className="bg-dark-500/50" {...props} />,
                  th: ({node, ...props}) => <th className="border border-dark-300 px-3 py-2 text-left text-dark-50 font-semibold" {...props} />,
                  td: ({node, ...props}) => <td className="border border-dark-300 px-3 py-2 text-dark-100" {...props} />,
                  // Horizontal Rule
                  hr: ({node, ...props}) => <hr className="border-dark-300 my-4" {...props} />,
                  // Strong/Bold
                  strong: ({node, ...props}) => <strong className="font-bold text-dark-50" {...props} />,
                  // Emphasis/Italic
                  em: ({node, ...props}) => <em className="italic text-dark-100" {...props} />,
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