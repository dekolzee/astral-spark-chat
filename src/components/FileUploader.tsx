
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paperclip, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFilesUploaded: (files: Array<{ id: string; name: string; type: string; url: string; size: number }>) => void;
}

export default function FileUploader({ onFilesUploaded }: FileUploaderProps) {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    onFilesUploaded(newFiles);
    
    toast({
      title: "Files uploaded",
      description: `${acceptedFiles.length} file(s) added to your message`,
    });
  }, [onFilesUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-11 w-11 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
        title="Upload files or images"
      >
        {isDragActive ? (
          <Image className="w-5 h-5" />
        ) : (
          <Paperclip className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
