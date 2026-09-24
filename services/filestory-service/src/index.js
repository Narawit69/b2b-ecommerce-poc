const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Minio = require('minio');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8003;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Prepare local upload directory as fallback storage
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(LOCAL_UPLOAD_DIR));

// MinIO Configuration
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadminpassword';
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'b2b-products';
const MINIO_PUBLIC_BASE = process.env.MINIO_PUBLIC_URL || `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_BUCKET}`;

let minioClient = null;
let useMinio = false;

try {
  minioClient = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY
  });

  // Verify MinIO connection & ensure bucket exists
  minioClient.bucketExists(MINIO_BUCKET, (err, exists) => {
    if (err) {
      console.warn('[FileStory Service] MinIO not available, using local media gateway fallback:', err.message);
      useMinio = false;
      return;
    }
    if (!exists) {
      minioClient.makeBucket(MINIO_BUCKET, 'us-east-1', (makeErr) => {
        if (makeErr) {
          console.warn('[FileStory Service] Failed to create MinIO bucket:', makeErr.message);
        } else {
          console.log(`[FileStory Service] Created bucket '${MINIO_BUCKET}' in MinIO.`);
          setPublicBucketPolicy(MINIO_BUCKET);
        }
      });
    } else {
      console.log(`[FileStory Service] Connected to MinIO bucket '${MINIO_BUCKET}'.`);
      setPublicBucketPolicy(MINIO_BUCKET);
    }
    useMinio = true;
  });
} catch (error) {
  console.warn('[FileStory Service] MinIO init error, falling back to local gateway:', error.message);
}

function setPublicBucketPolicy(bucketName) {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetBucketLocation', 's3:ListBucket'],
        Resource: [`arn:aws:s3:::${bucketName}`]
      },
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`]
      }
    ]
  };
  minioClient.setBucketPolicy(bucketName, JSON.stringify(policy), (err) => {
    if (err) console.warn('[FileStory Service] Set bucket policy warning:', err.message);
    else console.log(`[FileStory Service] Public Read policy successfully set for '${bucketName}'`);
  });
}

// Multer memory storage for direct upload streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed!'));
    }
  }
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    service: 'FileStory (Media Storage Gateway)',
    status: 'ONLINE',
    port: PORT,
    storage: useMinio ? `MinIO Object Storage (${MINIO_BUCKET})` : 'Local Media Gateway Fallback',
    minio_endpoint: `${MINIO_ENDPOINT}:${MINIO_PORT}`,
    timestamp: new Date().toISOString()
  });
});

// 1. Upload Image (Multipart/form-data)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;

    if (useMinio && minioClient) {
      // Upload directly into MinIO bucket
      const metaData = {
        'Content-Type': req.file.mimetype,
        'Original-Filename': encodeURIComponent(req.file.originalname)
      };

      await new Promise((resolve, reject) => {
        minioClient.putObject(
          MINIO_BUCKET,
          filename,
          req.file.buffer,
          req.file.size,
          metaData,
          (err, etag) => {
            if (err) return reject(err);
            resolve(etag);
          }
        );
      });

      const imageUrl = `${MINIO_PUBLIC_BASE}/${filename}`;
      console.log(`[FileStory Service] File successfully uploaded to MinIO: ${imageUrl}`);
      return res.status(201).json({
        success: true,
        filename,
        url: imageUrl,
        storage: 'MinIO',
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    }

    // Local file fallback
    const localFilePath = path.join(LOCAL_UPLOAD_DIR, filename);
    fs.writeFileSync(localFilePath, req.file.buffer);

    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${PORT}`;
    const imageUrl = `${protocol}://${host}/uploads/${filename}`;

    console.log(`[FileStory Service] File saved to Local Gateway: ${imageUrl}`);
    return res.status(201).json({
      success: true,
      filename,
      url: imageUrl,
      storage: 'LocalMediaGateway',
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('[FileStory Service] Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image file', details: error.message });
  }
});

// 2. Delete Image (Cleanup MinIO file when product is deleted)
app.delete('/api/files/:filename', async (req, res) => {
  const { filename } = req.params;
  try {
    if (useMinio && minioClient) {
      await new Promise((resolve, reject) => {
        minioClient.removeObject(MINIO_BUCKET, filename, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      console.log(`[FileStory Service] Removed object '${filename}' from MinIO.`);
      return res.json({ success: true, message: `File ${filename} removed from MinIO` });
    }

    const localFilePath = path.join(LOCAL_UPLOAD_DIR, filename);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log(`[FileStory Service] Removed local file '${filename}'.`);
    }
    return res.json({ success: true, message: `File ${filename} removed` });
  } catch (error) {
    console.error('[FileStory Service] Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file', details: error.message });
  }
});

// Helper delete by URL query param (?url=...)
app.delete('/api/files', async (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) return res.status(400).json({ error: 'Missing file URL' });

  try {
    const filename = path.basename(new URL(fileUrl).pathname);
    if (useMinio && minioClient) {
      await new Promise((resolve, reject) => {
        minioClient.removeObject(MINIO_BUCKET, filename, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      return res.json({ success: true, message: `File ${filename} removed from MinIO` });
    }

    const localFilePath = path.join(LOCAL_UPLOAD_DIR, filename);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return res.json({ success: true, message: `File ${filename} removed` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file from URL', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[FileStory Service] Running on port ${PORT}`);
});
