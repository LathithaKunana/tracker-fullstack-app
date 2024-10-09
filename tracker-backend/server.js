const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');
const multer = require('multer');
const cors = require('cors');

const upload = multer();
const app = express();
app.use(cors());

const ACRCloudConfig = {
    host: 'identify-eu-west-1.acrcloud.com',
    endpoint: '/v1/identify',
    access_key: '4398e82be8e4bfcda084fbcc91925d65',
    access_secret: 'aOidRscmcsAKe4WYXLS3D35duAT9mmpIhAYCBpUp',
    data_type: 'audio',
    signature_version: '1'
};

function getACRCloudSignature() {
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = [
        'POST',
        ACRCloudConfig.endpoint,
        ACRCloudConfig.access_key,
        ACRCloudConfig.data_type,
        ACRCloudConfig.signature_version,
        timestamp
    ].join('\n');

    const signature = crypto.createHmac('sha1', ACRCloudConfig.access_secret)
        .update(Buffer.from(stringToSign, 'utf-8'))
        .digest()
        .toString('base64');

    return { signature, timestamp };
}

app.post('/api/identify', upload.single('sample'), async (req, res) => {
    try {
        console.log(`[LOG] Received request to /api/identify at ${new Date().toISOString()}`);
        
        if (!req.file) {
            console.log('[ERROR] No file received');
            return res.status(400).json({ message: 'No audio file received' });
        }

        const { signature, timestamp } = getACRCloudSignature();
        const form = new FormData();

        // Add required fields
        form.append('sample', req.file.buffer, {
            filename: 'sample.wav',
            contentType: 'audio/wav'
        });
        form.append('access_key', ACRCloudConfig.access_key);
        form.append('data_type', ACRCloudConfig.data_type);
        form.append('signature_version', ACRCloudConfig.signature_version);
        form.append('signature', signature);
        form.append('timestamp', timestamp.toString());
        form.append('sample_bytes', req.file.size.toString());

        console.log(`[LOG] Sending request to ACRCloud`);
        
        const response = await axios.post(
            `https://${ACRCloudConfig.host}${ACRCloudConfig.endpoint}`,
            form,
            {
                headers: {
                    ...form.getHeaders()
                }
            }
        );

        console.log(`[LOG] ACRCloud response:`, JSON.stringify(response.data, null, 2));
        res.json(response.data);

    } catch (error) {
        console.error('[ERROR] ACRCloud request failed:', error.response?.data || error.message);
        res.status(500).json({ 
            message: 'Failed to recognize audio', 
            error: error.response?.data || error.message 
        });
    }
});

app.listen(3000, () => {
    console.log('[LOG] Server running on port 3000');
});