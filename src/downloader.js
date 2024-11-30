const https = require('https');
const fs = require('fs');
const path = require('path');

// Function to download a file
export function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }

            const fileStream = fs.createWriteStream(outputPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve(`File saved to ${outputPath}`);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}
