import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from "firebase/storage";
import { storage } from "./firebase";

// Upload a file to Firebase Storage
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { url: downloadURL, error: null };
  } catch (error) {
    return { url: null, error: error.message };
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (files, folderPath) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const path = `${folderPath}/${Date.now()}_${file.name}`;
      return uploadFile(file, path);
    });
    const results = await Promise.all(uploadPromises);
    return { results, error: null };
  } catch (error) {
    return { results: null, error: error.message };
  }
};

// Get download URL for a file
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { url, error: null };
  } catch (error) {
    return { url: null, error: error.message };
  }
};

// Delete a file from Storage
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// List all files in a folder
export const listFiles = async (folderPath) => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    const files = await Promise.all(
      result.items.map(async (itemRef) => ({
        name: itemRef.name,
        fullPath: itemRef.fullPath,
        url: await getDownloadURL(itemRef)
      }))
    );
    return { files, error: null };
  } catch (error) {
    return { files: null, error: error.message };
  }
};
