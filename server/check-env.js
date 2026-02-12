require('dotenv').config();
console.log('Diagnostics - Environment Variables Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
// Masking secret for security but checking length
console.log('CLOUDINARY_API_SECRET Length:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0);
