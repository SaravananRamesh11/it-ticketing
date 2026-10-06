const { GetObjectCommand } = require('@aws-sdk/client-s3');
const r2 = require('../config/r2');

// Fetch the closed-tickets CSV for a month from R2 (returns the body stream)
const getClosedTicketsFile = async (month, year) => {
  const fileName = `IT-TICKETING/tickets/tickets-${month.toLowerCase()}-${year}.csv`;

  const getCommand = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
  });

  console.log(`Sending GetObjectCommand for: ${fileName}`);

  try {
    const response = await r2.send(getCommand);
    console.log(`File fetched successfully: ${fileName}`);
    return response.Body;
  } catch (error) {
    console.error('R2 download error:', error);
    throw new Error('File not found in R2');
  }
};

module.exports = { getClosedTicketsFile };
