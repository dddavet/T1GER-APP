import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp, Paperclip, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SleekChatInputProps {
  onSend: (message: string, file?: File) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export const SleekChatInput: React.FC<SleekChatInputProps> = ({
  onSend,
  isLoading = false,
  placeholder = 'Pregúntale a T1GER...',
  className = '',
}) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if ((trimmed || selectedFile) && !isLoading) {
      onSend(trimmed, selectedFile || undefined);
      setText('');
      removeFile();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = text.trim().length > 0 || Boolean(selectedFile);

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      {/* File attachment preview pill */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="mb-2 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#18181D]/90 px-3 py-1.5 backdrop-blur-md shadow-lg"
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="h-9 w-9 rounded-lg object-cover border border-white/10"
            />
            <span className="text-xs text-zinc-300 truncate max-w-[140px]">
              {selectedFile?.name}
            </span>
            <button
              onClick={removeFile}
              className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main minimal input container */}
      <div className="relative flex items-end gap-2 rounded-[28px] border border-white/10 bg-[#141418]/90 p-2 pl-3.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] focus-within:border-[var(--ob-accent)]/50 transition-all duration-200 ring-1 ring-white/5">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition cursor-pointer mb-0.5"
          title="Adjuntar imagen"
        >
          <Paperclip size={18} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </button>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          className="max-h-28 min-h-[38px] flex-1 resize-none bg-transparent py-2 text-[14px] text-zinc-100 placeholder-zinc-500 outline-none leading-5"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!hasContent || isLoading}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 mb-0.5 ${
            hasContent && !isLoading
              ? 'bg-[var(--ob-accent)] text-black shadow-[0_2px_12px_rgba(255,115,0,0.4)] scale-100 cursor-pointer active:scale-90'
              : 'bg-white/5 text-zinc-600 cursor-not-allowed scale-95'
          }`}
          aria-label="Enviar mensaje"
        >
          <ArrowUp size={18} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
};
