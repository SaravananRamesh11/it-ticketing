const { S3Client } = require("@aws-sdk/client-s3");

// Cloudflare R2 is S3-compatible: same SDK, custom endpoint, region "auto".
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Public URL for an object key (R2_PUBLIC_URL = r2.dev URL or custom domain)
const getPublicUrl = (key) => {
  const base = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');
  return `${base}/${key}`;
};

module.exports = r2;
module.exports.getPublicUrl = getPublicUrl;
