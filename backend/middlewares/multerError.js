import multer from "multer";

export const multerErrorHandling = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
  } else {
    next(err);
  }
};