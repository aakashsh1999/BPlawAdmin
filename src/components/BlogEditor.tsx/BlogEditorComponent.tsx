"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { saveBlogPostWithImage } from "@/app/service/blogService";
import { ArrowLeft, Loader2 } from "lucide-react";
import { TagInput } from "@/components/tag-input";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";

const BlogEditorComponent = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = [
    "Indian Constitution",
    "Criminal Law",
    "Civil Law",
    "Contract Law",
    "Property Law",
    "Intellectual Property Rights",
    "Family Law",
    "Corporate Law",
    "Tax Law",
    "Environmental Law",
    "Human Rights",
    "International Law",
    "Cyber Law",
    "Media Law",
    "Labor Law",
    "Banking Law",
  ];

  const handleImageChange = (url: string | null) => {
    setCoverImageUrl(url);
    setCoverImageFile(null);
  };

  const handleFileSelect = (file: File | null) => {
    setCoverImageFile(file);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !excerpt) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (selectedTags.length === 0) {
      toast({
        title: "Tags required",
        description: "Please select at least one tag.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const blogPostData = {
        title,
        excerpt,
        content,
        metaTitle,
        metaDescription,
        keywords,
        author: {
          name: "Admin",
        },
        tags: selectedTags,
        coverImageUrl: coverImageUrl || undefined, // Include the URL if available
      };

      // Pass the File object for upload, if it exists
      const newPost = await saveBlogPostWithImage(
        blogPostData,
        coverImageFile || null // Pass the File object, or null if no new file
      );

      toast({
        title: "Post created!",
        description: "Your blog post has been published successfully.",
      });

      if (newPost?.id) {
        onClose?.();
      }
    } catch (error) {
      console.error("Failed to save blog post:", error);
      toast({
        title: "Error",
        description: "Failed to publish your post. Please try again.",
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
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  className="text-lg"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Write a brief summary of your post"
                  rows={3}
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here... (Supports Markdown)"
                  className="min-h-[300px] font-mono"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Markdown supported. Use # for headings, ** for bold, * for italic, etc.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                <ImageUpload
                  value={coverImageUrl || ""}
                  onChange={handleImageChange}
                  onFileSelect={handleFileSelect}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags <span className="text-red-500">*</span>{" "}
                  <span className="text-xs text-gray-500">(Select up to 3)</span>
                </label>
                <TagInput
                  selectedTags={selectedTags}
                  availableTags={availableTags}
                  onChange={setSelectedTags}
                  maxTags={3}
                  allowCustomTags={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-blog hover:bg-blog-hover bg-blue-500 hover:bg-blue-300 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditorComponent;