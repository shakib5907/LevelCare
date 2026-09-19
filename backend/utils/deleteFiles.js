import fs from "fs";

export const deleteFiles = (files) => {
  files.forEach((path) => {
    fs.unlink(path, (err) => {
      if (err) {
        console.error("Failed to delete temporary upload file:", err);
      }
    });
  });
};