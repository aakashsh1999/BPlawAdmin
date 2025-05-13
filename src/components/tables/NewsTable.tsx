"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "../../../config";
import Button from "../ui/button/Button";
import { Timestamp } from "firebase/firestore"; // Import Timestamp
import { Delete, DeleteIcon, Edit, EditIcon, Trash, Trash2 } from "lucide-react";
import BlogEditableModal from "../BlogEditor.tsx/BlogEditModal";
import { deleteBlogPost } from "@/app/service/blogService";
import { toast } from "react-toastify";

interface BlogPost {
  id: string;
  title: string;
  author: { name: string }; // Assuming 'author' is an object with a 'name' property
  excerpt: string;
  createdAt: Timestamp; // Use Firebase Timestamp type
  status: "published" | "draft";
}

const PAGE_SIZE = 10;

export default function NewsTable({
  refreshRequired ,
  setRefreshRequired,
}:{
  refreshRequired: boolean,
  setRefreshRequired: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);


  const fetchPosts = async (nextPage = false) => {
    setLoading(true);
    setError(null);

    try {
      const postsRef = collection(db, "blogPosts");
      let q = query(postsRef, orderBy("createdAt"), limit(PAGE_SIZE));

      if (nextPage && lastDoc) {
        q = query(postsRef, orderBy("createdAt"), startAfter(lastDoc), limit(PAGE_SIZE));
      } else if (!nextPage && posts.length > 0 && lastDoc) {
        // If not loading the next page, and we have posts and lastDoc,
        // we might be refreshing the current view. Re-fetch from the beginning.
         q = query(postsRef, orderBy("createdAt"), limit(PAGE_SIZE));
      }


      const querySnapshot = await getDocs(q);
      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Ensure createdAt is a Timestamp if it's not already
        createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt : Timestamp.fromDate(new Date(doc.data().createdAt.seconds * 1000))
      })) as BlogPost[];

      setPosts((prevPosts) =>
        nextPage ? [...prevPosts, ...fetchedPosts] : fetchedPosts
      );

      setLastDoc(
        querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
      );
    } catch (err) {
      setError("Failed to fetch blog posts. Please try again.");
      console.error("Error fetching blog posts:", err);
    } finally {
      setLoading(false);
      setRefreshRequired(false); // Reset refresh required flag
    }
  };

  useEffect(() => {
    fetchPosts(false);
  }, [refreshRequired]); // Depend on refreshRequired

  const handleLoadMore = () => {
    if (lastDoc) {
      fetchPosts(true);
    }
  };

  const formatDate = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) {
      return "";
    }
    try {
      const date = timestamp.toDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const deletPost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteBlogPost(postId);
      toast.success("Post deleted successfully");
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      toast.error("Failed to delete post");
      console.error("Error deleting post:", error);
    }
  };

  // Callback function to be called after a successful edit
  const handlePostEdited = () => {
    setIsEditModalOpen(false); // Close the modal
    setRefreshRequired(true);
    toast.success("Post updated successfully");
  };


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
      <BlogEditableModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={selectedPost}
        onSaveSuccess={handlePostEdited} // Pass the callback here
      />
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Blog Post ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Title
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Author
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Excerpt
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {posts.length > 0 && posts?.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {post?.id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {post?.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {"Admin"} {/* Access the 'name' property */}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {post?.excerpt}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(post?.createdAt)}
                  </TableCell>

                  <TableCell className="px-4 flex gap-x-2 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <EditIcon
                      className="hover:text-red-300 cursor-pointer"
                      onClick={() => {
                        setSelectedPost(post);
                        setIsEditModalOpen(true);
                      }}
                    />
                    <Trash2
                      className="text-red-500 cursor-pointer"
                      onClick={() => {
                        deletPost(post.id);
                      }}
                    />
                  </TableCell>

                </TableRow>
              ))}

              {loading && (
                <TableRow>
                  <TableCell  className="px-2 w-full py-4 text-center text-gray-500 dark:text-gray-400">
                    Loading{posts.length > 0 ? " more" : ""} posts...
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                   <TableCell className="px-2 py-4 text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              )}
               {posts.length > 0 && !loading && lastDoc && (
                <TableRow>
                  <TableCell className="py-4 text-center">
                    <Button onClick={handleLoadMore} variant="outline" size="sm">
                      Load More
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {posts.length === 0 && !loading && !error && (
                <TableRow>
                   <TableCell className="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}