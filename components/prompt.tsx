"use client";

import { Send, MessageSquarePlus, Image as ImageIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRef, useState } from "react";

export default function PromptBox({
  input,
  handleInputChange,
  handleSubmit,
  onFeedbackClick,
  onFileSelect,
}: {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFeedbackClick: () => void;
  onFileSelect?: (files: FileList | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Store file names for display
      const fileNames = Array.from(e.target.files).map((file) => file.name);
      setSelectedFileNames(fileNames);

      // Call the parent handler
      if (onFileSelect) {
        onFileSelect(e.target.files);
      }
    } else {
      setSelectedFileNames([]);
      if (onFileSelect) {
        onFileSelect(null);
      }
    }
  };

  const clearFiles = () => {
    setSelectedFileNames([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e);
    // Clear the file selection display after submitting
    setSelectedFileNames([]);
  };

  return (
    <div className="border-t p-4 bg-white z-20">
      {selectedFileNames.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selectedFileNames.map((name, index) => (
            <div
              key={index}
              className="bg-gray-100 text-gray-800 text-xs rounded px-2 py-1 flex items-center gap-1"
            >
              <ImageIcon className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{name}</span>
              <button
                type="button"
                onClick={clearFiles}
                className="hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          multiple
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-10 w-10 shrink-0 rounded-full ${
            selectedFileNames.length > 0
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "hover:bg-gray-100"
          }`}
          onClick={handleFileButtonClick}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about insurance coverage..."
          className="flex-1 rounded-full border-gray-200 bg-gray-50 focus-visible:ring-gray-900 shadow-sm"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100"
        >
          <Send className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100"
          onClick={onFeedbackClick}
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
