import multer, { memoryStorage } from 'multer';
const upload = multer({
    storage: memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('Incorrect file');
            error.code = 'INCORRECT_FILETYPE';
            return cb(error, false);
        }
        cb(null, true);
    }
});

export default upload;
