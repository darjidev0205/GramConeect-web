import React, { useState, useRef } from 'react';
import { Camera, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';

export const AvatarUpload = ({ currentImage, onUploadSuccess, onRemoveSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side file type validation
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setError('Please select a valid image file (.jpg, .png, .webp)');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setError('');
    setIsUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      setUploadProgress(50);
      
      const response = await fetch('http://localhost:5000/api/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      setUploadProgress(80);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Image upload failed');
      }

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(data.imageUrl);
      }, 300);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error uploading image');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile image?')) return;
    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        onRemoveSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Error removing image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group w-28 h-28">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-all bg-neutral-950 flex items-center justify-center">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Profile avatar" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/75 rounded-full flex flex-col items-center justify-center p-3 animate-in fade-in">
            <Loader2 className="w-6 h-6 animate-spin text-primary mb-1" />
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {!isUploading && (
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center cursor-pointer text-white"
          >
            <Camera className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-xl border-white/5 hover:bg-white/5 text-xxs h-8 cursor-pointer"
        >
          Replace Image
        </Button>
        {currentImage && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl text-xxs h-8 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {error && <p className="text-xxs text-red-400 mt-1">{error}</p>}
    </div>
  );
};
