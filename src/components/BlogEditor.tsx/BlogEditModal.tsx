"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlogEditComponent } from "./BlogEditComponent"; // Import the correct component
import type { BlogPost } from "@/types/blog"; // If you have a shared BlogPost type

interface BlogEditableModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null; // You need to pass the post to edit
  onSaveSuccess: () => void;
}

const BlogEditableModal: React.FC<BlogEditableModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  post,
}) => {
  if (!post) return null; // Prevent rendering if no post is provided

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[80vh] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
        </DialogHeader>
        <BlogEditComponent post={post} onClose={onClose} onSaveSuccess={onSaveSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default BlogEditableModal;
