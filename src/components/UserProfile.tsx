
import React, { useState } from 'react';
import { User, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      await updateProfile({ avatar_url: imageUrl });
      
      toast({
        title: "Profile updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getUserInitials = () => {
    const email = user?.email || '';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative group">
      <Avatar className="w-8 h-8 ring-2 ring-purple-500/20">
        <AvatarImage 
          src={user?.user_metadata?.avatar_url} 
          alt="Profile" 
        />
        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-teal-500 text-white text-sm font-medium">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <Camera className="w-4 h-4 text-white" />
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
