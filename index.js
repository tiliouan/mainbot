const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = process.env.PORT || 3000;

// Mapping of file names to file paths
const fileMapping = {
  'file1.pdf': '/path/to/file1.pdf',
  'image.jpg': '/path/to/image.jpg',
  'data.xlsx': '/path/to/data.xlsx',
};

// Replies stored in the source code
const replies = {};

// Create a new WhatsApp client instance
const client = new Client({
  authStrategy: new LocalAuth(),
});

// Generate QR code for pairing
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

// Handle incoming messages
client.on('message', async (message) => {
  const { body, from } = message;

  // Check if the message matches any file name in the mapping
  if (fileMapping[body]) {
    const filePath = fileMapping[body];
    const media = await MessageMedia.fromFilePath(filePath);
    client.sendMessage(from, media, { caption: `Here's the file ${body}` });

    // Store the reply in the source code
    replies[from] = replies[from] || [];
    replies[from].push({ body, filePath });
  } else {
    client.sendMessage(from, `Sorry, I don't have a file named "${body}"`);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Initialize the WhatsApp client
client.initialize();