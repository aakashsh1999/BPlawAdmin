"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BlogEditor from ".";
import BlogEditorComponent from "./BlogEditorComponent";
interface BlogEditorModalProps {
  isOpen: boolean;
  onsaveSuccess?: () => void;
  onClose: () => void;
}

const BlogEditorModal: React.FC<BlogEditorModalProps> = ({ isOpen, onClose, onsaveSuccess }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="w-full overflow-y-auto max-h-[80vh] bg-white">
        <DialogHeader>
          <DialogTitle>Create a news or blog</DialogTitle>
        </DialogHeader>
        <BlogEditorComponent onClose={onClose} onsaveSuccess={onsaveSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default BlogEditorModal;
