"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storage } from "../../config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface ImageUploadProps {
  value: string | null; // Value can now be a URL or null
  onChange: (url: string) => void;
  presetImages?: Array<{ value: string; label: string }>;
  allowUpload?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  presetImages = [],
  allowUpload = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Generate a more generic filename
    const uniqueFileName = `blog-images/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, uniqueFileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);
    setUploadProgress(0);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Image upload error:", error);
        setIsUploading(false);
        setUploadProgress(0);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onChange(downloadURL); // Pass the image URL to parent component
        setIsUploading(false);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 500); // Reset the progress after a delay
      }
    );
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const clearImage = () => {
    onChange(""); // Clear the selected image URL
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Cover preview"
            className="w-full h-48 object-cover rounded-md"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-500">
          <ImageIcon className="h-12 w-12 mb-2" />
          <p className="text-sm mb-2">No image selected</p>
          {allowUpload && (
            <Button type="button" variant="outline" onClick={triggerFileInput} disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          )}
        </div>
      )}

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      {allowUpload && (
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* Preset image dropdown - only shows if no image is selected */}
      {!value && presetImages.length > 0 && (
        <div className="relative">
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
          >
            <option value="">Select a cover image</option>
            {presetImages.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}