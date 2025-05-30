import { useState } from "react";
import BlogEditorModal from "./BlogEditorModal";
import { Button } from "@/components/ui/button";

export default function AddBlogModal({onsaveSuccess}: {onsaveSuccess?: () => void}) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white">New Post</Button>
      <BlogEditorModal  isOpen={open} onClose={() => setOpen(false)} onsaveSuccess={onsaveSuccess} />
    </>
  );
}
