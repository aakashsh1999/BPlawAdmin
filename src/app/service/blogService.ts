// In your "@/app/service/blogService.ts"

import { storage, db } from "../../../config"; // Assuming you have your Firebase initialized here
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc ,   doc,
  deleteDoc, getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

interface BlogPostData {
  title: string;
  excerpt: string;
  content: string;
  author: { name: string };
  tags: string[];
  coverImageUrl?: string; // Optional as the user might not upload an image
}

export const saveBlogPostWithImage = async (
  blogPostData: Omit<BlogPostData, "coverImageUrl"> & { coverImageUrl?: string },
  coverImageFile: File | null
): Promise<{ id: string } | null> => {
  try {
    let coverImageUrl = blogPostData.coverImageUrl; // Use the URL if it's already provided

    if (coverImageFile) {
      // 1. Upload the image to Firebase Storage with a generic path
      const uniqueFileName = `blog-images/${Date.now()}-${coverImageFile.name}`;
      const storageRef = ref(storage, uniqueFileName);
      const uploadTask =  uploadBytesResumable(storageRef, coverImageFile);
      await uploadTask;

      // 2. Get the download URL
      coverImageUrl = await getDownloadURL(storageRef);
    }

    // 3. Save the blog post data to Firestore
    const postsCollectionRef = collection(db, "blogPosts");
    const docRef = await addDoc(postsCollectionRef, {
      ...blogPostData,
      coverImageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { id: docRef.id };
  } catch (error) {
    console.error("Error saving blog post with image:", error);
    throw error; // Re-throw the error to be caught by the component
  }
};

// You might still have a simpler saveBlogPost function if you allow posts without images
export const saveBlogPost = async (blogPostData: BlogPostData): Promise<{ id: string } | null> => {
  try {
    const postsCollectionRef = collection(db, "blogPosts");
    const docRef = await addDoc(postsCollectionRef, {
      ...blogPostData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error saving blog post:", error);
    throw error;
  }
};

// import { storage, db } from "../../../config";
// import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
// import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";

interface BlogPostUpdateData {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
}

export const updateBlogPostWithImage = async (
  id: string,
  blogPostData: BlogPostUpdateData,
  newCoverImageFile: File | null,
  newCoverImageUrl: string | null
): Promise<void> => {
  try {
    const postRef = doc(db, "blogPosts", id);
    const updateData: any = {
      ...blogPostData,
      updatedAt: serverTimestamp(),
    };

    if (newCoverImageFile) {
      // Upload the new image
      const uniqueFileName = `blog-images/${Date.now()}-${newCoverImageFile.name}`;
      const storageRef = ref(storage, uniqueFileName);
      const uploadTask = uploadBytesResumable(storageRef, newCoverImageFile);
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      updateData.coverImageUrl = downloadURL;

      // Optionally delete the old image from storage
      const postSnap = await getDoc(postRef);
      if (postSnap.exists() && postSnap.data()?.coverImageUrl && postSnap.data().coverImageUrl !== downloadURL) {
        try {
          const oldImageRef = ref(storage, postSnap.data().coverImageUrl);
          await deleteObject(oldImageRef);
          console.log("Old cover image deleted.");
        } catch (error: any) {
          console.warn("Error deleting old cover image:", error.message);
        }
      }
    } else if (newCoverImageUrl) {
      // Use the new URL (from preset)
      updateData.coverImageUrl = newCoverImageUrl;

      // Optionally delete the old image if the new URL is different
      const postSnap = await getDoc(postRef);
      if (postSnap.exists() && postSnap.data()?.coverImageUrl && postSnap.data().coverImageUrl !== newCoverImageUrl) {
        try {
          const oldImageRef = ref(storage, postSnap.data().coverImageUrl);
          await deleteObject(oldImageRef);
          console.log("Old cover image deleted.");
        } catch (error: any) {
          console.warn("Error deleting old cover image:", error.message);
        }
      }
    }

    await updateDoc(postRef, updateData);
  } catch (error) {
    console.error("Error updating blog post:", error);
    throw error;
  }
};


export const deleteBlogPost = async (postId: string): Promise<void> => {
  try {
    const postRef = doc(db, "blogPosts", postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const data = postSnap.data();
      const coverImageUrl = data.coverImageUrl;

      // Delete the Firestore document
      await deleteDoc(postRef);

      // Optional: Delete image from Firebase Storage
      if (coverImageUrl) {
        const imageRef = ref(storage, coverImageUrl);
        await deleteObject(imageRef).catch((err) => {
          console.warn("Failed to delete image from storage:", err.message);
        });
      }
    } else {
      throw new Error("Post not found");
    }
  } catch (error) {
    console.error("Error deleting blog post:", error);
    throw error;
  }
};