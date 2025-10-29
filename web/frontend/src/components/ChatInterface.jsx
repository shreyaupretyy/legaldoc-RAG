import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, BookOpen, AlertTriangle, RefreshCw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SourceCitation from './SourceCitation';
import { chatAPI } from '../services/api';

const ChatInterface = ({ hasDocuments }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: userMessage 
    }]);

    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(userMessage, conversationId);
      
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.answer,
        sources: response.sources,
        isContextBased: response.is_context_based
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        sources: [],
        isContextBased: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What are the fundamental rights in the Constitution of Nepal?",
    "Who can become the Prime Minister of Nepal?",
    "What is the structure of the Federal Parliament?",
    "What are the directive principles and policies?",
  ];

  const handleSuggestionClick = (question) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header with New Chat button */}
      {messages.length > 0 && (
        <div className="border-b border-slate-200 px-6 py-4 bg-white flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-slate-600 font-semibold">Active Chat</span>
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 transition-all text-sm font-semibold shadow-sm hover:shadow"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      )}
      
      {/* No Documents Warning */}
      {!hasDocuments && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-center space-x-3 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="text-sm font-semibold">No documents indexed</p>
              <p className="text-xs text-amber-600">Upload a PDF to start asking questions</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-2xl px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Welcome to LegalDocRAG
              </h3>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Ask questions about your legal documents and get accurate answers with citations.
              </p>

              {hasDocuments && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700 mb-4">
                    Try asking:
                  </p>
                  <div className="grid gap-3">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(question)}
                        className="text-left bg-white hover:bg-teal-50 border-2 border-slate-200 hover:border-teal-300 rounded-xl px-6 py-4 text-base text-slate-700 hover:text-slate-900 transition-all shadow-sm hover:shadow-md font-medium"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {messages.map((message, index) => (
              <div key={index}>
                <MessageBubble
                  message={message.content}
                  isUser={message.type === 'user'}
                />
                {message.type === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mb-6 ml-16">
                    <SourceCitation sources={message.sources} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
                  <Loader className="w-5 h-5 text-teal-500 animate-spin" />
                  <span className="text-slate-700 font-semibold">Analyzing documents...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 p-6 bg-white shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end space-x-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasDocuments ? "Ask about your documents..." : "Upload a document first..."}
              disabled={!hasDocuments || loading}
              rows="1"
              className="flex-1 resize-none rounded-2xl border-2 border-slate-300 focus:border-teal-400 bg-white px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all text-slate-900 placeholder-slate-400 text-base font-medium shadow-sm"
              style={{ maxHeight: '150px', minHeight: '60px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || !hasDocuments}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all shadow-md hover:shadow-lg"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Press <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono">Enter</kbd> to send • <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;