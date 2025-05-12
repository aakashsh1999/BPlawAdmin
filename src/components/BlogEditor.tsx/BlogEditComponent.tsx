"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { TagInput } from "@/components/tag-input";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { updateBlogPostWithImage } from "@/app/service/blogService";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  coverImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

const availableTags = [
  "Indian Constitution", "Criminal Law", "Civil Law", "Contract Law", "Property Law",
  "Intellectual Property Rights", "Family Law", "Corporate Law", "Tax Law", "Environmental Law",
  "Human Rights", "International Law", "Cyber Law", "Media Law", "Labor Law", "Banking Law",
];

export const BlogEditComponent = ({
  post,
  onClose,
}: {
  post: BlogPost;
  onClose?: () => void;
}) => {
  const { toast } = useToast();

  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [metaTitle, setMetaTitle] = useState(post.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post.metaDescription || "");
  const [keywords, setKeywords] = useState(post.keywords || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(post.tags || []);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(post.coverImageUrl || null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create preset images array with the current image if it exists
  const presetImages = post.coverImageUrl ? [{ value: post.coverImageUrl, label: "Current Image" }] : [];

  const handleImageChange = (url: string | null) => {
    setCoverImageUrl(url);
    setCoverImageFile(null); // Reset the file when a URL is selected (preset or new upload)
  };

  const handleFileSelect = (file: File | null) => {
    setCoverImageFile(file);
    // If a new file is selected, we don't immediately update coverImageUrl,
    // as the upload needs to happen in handleSubmit.
    setCoverImageUrl(null); // Clear any previously selected URL when a new file is chosen
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !excerpt || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBlogPostWithImage(
        post.id,
        {
          title,
          excerpt,
          content,
          tags: selectedTags,
          metaTitle,
          metaDescription,
          keywords,
        },
        coverImageFile, // Pass the File object for upload
        coverImageUrl === post.coverImageUrl ? null : coverImageUrl // Pass new URL if it's different from the original
      );

      toast({
        title: "Post updated",
        description: "Your changes have been saved.",
      });

      onClose?.();
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Edit title"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Enter meta title for SEO"
                maxLength={255}
              />
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Enter meta description for SEO"
                rows={2}
                maxLength={255}
              />
            </div>

            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter comma-separated keywords for SEO"
              />
              <p className="mt-1 text-xs text-gray-500">Separate keywords with commas (e.g., law, india, constitution)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              <ImageUpload
                value={coverImageUrl}
                onChange={handleImageChange}
                onFileSelect={handleFileSelect}
                presetImages={presetImages}
                allowUpload={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags <span className="text-red-500">*</span>{" "}
                <span className="text-xs text-gray-500">(Max 3)</span>
              </label>
              <TagInput
                selectedTags={selectedTags}
                availableTags={availableTags}
                onChange={setSelectedTags}
                maxTags={3}
                allowCustomTags={true}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};