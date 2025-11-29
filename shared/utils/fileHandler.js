const crypto = require('crypto');
const sharp = require('sharp');
const config = require('../../core/config');

// Process and upload evidence (base64 images)
exports.uploadEvidence = async (evidenceArray) => {
  const processed = [];

  for (const evidence of evidenceArray) {
    try {
      // Check if it's base64
      if (!evidence.startsWith('data:image/')) {
        continue;
      }

      // Extract base64 data
      const matches = evidence.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        continue;
      }

      const imageType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Check file size
      if (buffer.length > config.maxFileSize) {
        throw new Error('Archivo demasiado grande');
      }

      // Validate image type
      const mimeType = `image/${imageType}`;
      if (!config.allowedFileTypes.includes(mimeType)) {
        throw new Error('Tipo de archivo no permitido');
      }

      // Compress and resize image
      const processedBuffer = await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Generate hash for duplicate detection
      const hash = crypto
        .createHash('sha256')
        .update(processedBuffer)
        .digest('hex');

      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, store as base64
      const processedBase64 = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

      processed.push({
        url: processedBase64,
        hash: hash,
        uploadedAt: new Date()
      });

    } catch (error) {
      console.error('Error processing evidence:', error);
      // Skip invalid images
      continue;
    }
  }

  return processed;
};
