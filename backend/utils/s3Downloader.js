const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


// Generate signed URL or return file buffer
const getClosedTicketsFile = async (month, year) => {
  const fileName = `IT-TICKETING/tickets/tickets-${month.toLowerCase()}-${year}.csv`;

  const getCommand = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
  });

  console.log(`Sending GetObjectCommand for: ${fileName}`);

  try {
    // Option 1: Send the actual file (used if frontend expects CSV directly)
    const response = await s3.send(getCommand);
    console.log(`File fetched successfully: ${fileName}`);
    return response.Body;

    // Option 2: If you want to return a signed URL instead:
    // const url = await getSignedUrl(s3, getCommand, { expiresIn: 300 });
    // return url;

  } catch (error) {
    console.error('S3 download error:', error);
    throw new Error('File not found in S3');
  }
};

module.exports = { getClosedTicketsFile };
