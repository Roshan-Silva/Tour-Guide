import multer from 'multer';
import path from 'path';

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder where files will be saved
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Unique filename
  }
});

// Filter file types (optional)
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only images are allowed'), false);
//   }
// };

// const upload = multer({ storage, fileFilter });

const upload = multer({ storage });

export default upload;
