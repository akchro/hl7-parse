const express = require('express');
const multer = require('multer');
const { HL7 } = require('node-hl7-complete');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept .hl7, .txt, and files without extension
    const allowedExts = ['.hl7', '.txt', ''];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedExts.includes(ext));
  }
});

// Parse HL7 message from text
router.post('/parse', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'HL7 message is required' });
    }

    const hl7 = new HL7(message);
    const parsed = hl7.parse();
    
    res.json({
      success: true,
      parsed,
      segments: hl7.segments,
      messageType: hl7.getHeader('MSH.9.1'),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to parse HL7 message', 
      details: error.message 
    });
  }
});

// Upload and parse HL7 file
router.post('/upload', upload.single('hl7File'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const content = fs.readFileSync(req.file.path, 'utf8');
    
    const hl7 = new HL7(content);
    const parsed = hl7.parse();
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      filename: req.file.originalname,
      parsed,
      segments: hl7.segments,
      messageType: hl7.getHeader('MSH.9.1'),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to parse HL7 file', 
      details: error.message 
    });
  }
});

// Validate HL7 message structure
router.post('/validate', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'HL7 message is required' });
    }

    const hl7 = new HL7(message);
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Basic validation
    if (!message.startsWith('MSH')) {
      validation.isValid = false;
      validation.errors.push('Message must start with MSH segment');
    }

    // Check for required segments based on message type
    const messageType = hl7.getHeader('MSH.9.1');
    if (messageType === 'ADT' && !message.includes('PID')) {
      validation.isValid = false;
      validation.errors.push('ADT messages must contain PID segment');
    }

    res.json(validation);
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to validate HL7 message', 
      details: error.message 
    });
  }
});

module.exports = router;