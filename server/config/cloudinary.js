const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the image file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} - Upload result with url and public_id
 */
const uploadImage = async (filePath, folder = 'products') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `ecommerce/${folder}`,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file paths
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadMultipleImages = async (files, folder = 'products') => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Multiple image upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public_id of the image
 * @returns {Promise<object>} - Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public_ids
 * @returns {Promise<Array>} - Array of deletion results
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((id) => deleteImage(id));
    return await Promise.all(deletePromises);
  } catch (error) {
    throw new Error(`Multiple image deletion failed: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
};
