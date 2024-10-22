const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors()); 

// Configure multer to save files locally
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Specify the directory to save files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original file name
    }
});

const upload = multer({ storage });

// In-memory object to store file metadata
const fileDatabase = {};

// Upload route with custom file ID
app.post('/files/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const customFileId = req.body.fileId; // Get the custom file ID from the request body

    // Validate that the custom file ID is provided
    if (!customFileId) {
        return res.status(400).json({ message: 'File ID is required' });
    }

    // Check if the file ID already exists
    if (fileDatabase[customFileId]) {
        return res.status(400).json({ message: 'File ID already exists. Please use a unique ID.' });
    }

    // Store file metadata with the provided custom ID
    fileDatabase[customFileId] = {
        id: customFileId,
        filename: req.file.originalname,
        path: req.file.path // Store the path of the uploaded file
    };

    res.json({ fileId: customFileId, filename: req.file.originalname });
});

// Download route using custom file ID
app.get('/files/download/:id', (req, res) => {
    const fileId = req.params.id;
    const fileMetadata = fileDatabase[fileId];

    if (!fileMetadata) {
        return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, fileMetadata.path);
    res.download(filePath, (err) => {
        if (err) {
            res.status(404).send({ message: 'File not found' });
        }
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
