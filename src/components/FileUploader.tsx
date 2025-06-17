
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { File, Image, X, Upload, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface FileUpload {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

interface FileUploaderProps {
  onFilesUploaded: (files: Array<{ id: string; name: string; type: string; url: string; size: number }>) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'text/*', 'application/pdf']
}) => {
  const [uploads, setUploads] = useState<FileUpload[]>([]);

  const simulateUpload = async (file: File): Promise<string> => {
    // Simulate upload progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          clearInterval(interval);
          resolve(`https://example.com/uploads/${file.name}`);
        }
        
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { ...upload, progress: Math.min(progress, 100) }
            : upload
        ));
      }, 200);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: FileUpload[] = acceptedFiles.map(file => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Process uploads
    const uploadPromises = newUploads.map(async (upload) => {
      try {
        const url = await simulateUpload(upload.file);
        
        setUploads(prev => prev.map(u => 
          u.id === upload.id 
            ? { ...u, status: 'completed' as const, url, progress: 100 }
            : u
        ));

        return {
          id: upload.id,
          name: upload.file.name,
          type: upload.file.type,
          url,
          size: upload.file.size,
        };
      } catch (error) {
        setUploads(prev => prev.map(u => 
          u.id === upload.id 
            ? { ...u, status: 'error' as const }
            : u
        ));
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean) as Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      size: number;
    }>;

    if (successfulUploads.length > 0) {
      onFilesUploaded(successfulUploads);
    }
  }, [onFilesUploaded]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
  });

  const removeUpload = (id: string) => {
    setUploads(prev => {
      const upload = prev.find(u => u.id === id);
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter(u => u.id !== id);
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('text/') || type === 'application/pdf') return FileText;
    return File;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive && !isDragReject ? 'border-primary bg-primary/10 glow' : ''}
          ${isDragReject ? 'border-destructive bg-destructive/10' : ''}
          ${!isDragActive ? 'border-border hover:border-primary/50 hover:bg-primary/5' : ''}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        
        <motion.div
          className="space-y-4"
          animate={{ 
            scale: isDragActive ? 1.05 : 1,
            opacity: isDragActive ? 0.8 : 1 
          }}
        >
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <p className="text-lg font-semibold text-foreground">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Max {maxFiles} files, {Math.round(maxSize / 1024 / 1024)}MB each
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Upload List */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {uploads.map((upload) => {
              const FileIcon = getFileIcon(upload.file.type);
              
              return (
                <motion.div
                  key={upload.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-3">
                    <div className="flex items-center gap-3">
                      {/* File Icon/Preview */}
                      <div className="flex-shrink-0">
                        {upload.preview ? (
                          <img
                            src={upload.preview}
                            alt={upload.file.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <FileIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {upload.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(upload.file.size / 1024).toFixed(1)} KB
                        </p>
                        
                        {/* Progress Bar */}
                        {upload.status === 'uploading' && (
                          <Progress 
                            value={upload.progress} 
                            className="h-1 mt-1"
                          />
                        )}
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-2">
                        {upload.status === 'completed' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        {upload.status === 'error' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpload(upload.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
