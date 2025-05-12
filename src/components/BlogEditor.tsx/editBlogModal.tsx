// EditBlogModal.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  saveBlogPostWithImage, // Assuming this handles updates too, or create a new service
} from "@/app/service/blogService";
import { Loader2 } from "lucide-react";
import { TagInput } from "@/components/tag-input";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BlogPost {
  id: string;
  title: string;
  author: { name: string };
  excerpt: string;
  content: string;
  tags: string[];
  coverImageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: "published" | "draft";
}

interface EditBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPostData: BlogPost;
  onSave: (updatedPost: Omit<BlogPost, 'id'>) => void;
}

const EditBlogModal: React.FC<EditBlogModalProps> = ({
  isOpen,
  onClose,
  initialPostData,
  onSave,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(initialPostData?.title || "");
  const [excerpt, setExcerpt] = useState(initialPostData?.excerpt || "");
  const [content, setContent] = useState(initialPostData?.content || "");
  const [coverImage, setCoverImage] = useState<File | string | null>(initialPostData?.coverImageUrl || null);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialPostData?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = [
    "Indian Constitution", "Criminal Law", "Civil Law", "Contract Law", "Property Law",
    "Intellectual Property Rights", "Family Law", "Corporate Law", "Tax Law", "Environmental Law",
    "Human Rights", "International Law", "Cyber Law", "Media Law", "Labor Law", "Banking Law",
  ];

  const coverImages = [
    { value: "", label: "Select a cover image" },
    { value: "https://via.placeholder.com/150/FF0000", label: "Red Placeholder" },
    { value: "https://via.placeholder.com/150/00FF00", label: "Green Placeholder" },
  ];

  useEffect(() => {
    if (initialPostData) {
      setTitle(initialPostData.title || "");
      setExcerpt(initialPostData.excerpt || "");
      setContent(initialPostData.content || "");
      setCoverImage(initialPostData.coverImageUrl || null);
      setSelectedTags(initialPostData.tags || []);
    }
  }, [initialPostData]);

  const handleImageChange = (file: File | null) => {
    setCoverImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !excerpt) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (selectedTags.length === 0) {
      toast({ title: "Tags required", description: "Please select at least one tag.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      let updatedImageUrl: string | undefined = undefined;
      if (typeof coverImage === 'string') {
        updatedImageUrl = coverImage;
      } else if (coverImage instanceof File) {
        const uploadResult = await saveBlogPostWithImage(
          { title, excerpt, content, author: initialPostData.author, tags: selectedTags },
          coverImage
        );
        updatedImageUrl = uploadResult?.imageUrl; // Adjust based on your service response
      }

      const updatedPostData: Omit<BlogPost, 'id'> = {
        title,
        excerpt,
        content,
        author: initialPostData.author,
        tags: selectedTags,
        coverImageUrl: updatedImageUrl,
        createdAt: initialPostData.createdAt,
        updatedAt: Timestamp.now(),
        status: initialPostData.status,
      };

      await onSave(updatedPostData);
    } catch (error) {
      console.error("Failed to update blog post:", error);
      toast({ title: "Error", description: "Failed to update your post. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[80vh] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Excerpt <span className="text-red-500">*</span></label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} required />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="min-h-[200px] font-mono"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Markdown supported.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <ImageUpload value={coverImage} onChange={handleImageChange} presetImages={coverImages} allowUpload={true} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Select up to 3)</span></label>
            <TagInput selectedTags={selectedTags} availableTags={availableTags} onChange={setSelectedTags} maxTags={3} allowCustomTags={true} />
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBlogModal;