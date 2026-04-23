import * as crypto from 'crypto';
import * as fs from 'fs';

export const getFileHash = async (filepath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filepath, { start: 0, end: 65535 });

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => {
      const finalhash = hash.digest('hex');
      resolve(finalhash);
    });
    stream.on('error', (error) => reject(error));
  });
};
