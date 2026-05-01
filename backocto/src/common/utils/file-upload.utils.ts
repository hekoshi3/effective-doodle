/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as fs from 'fs';
import { extname } from 'path';

export const editFileName = (file: any, callback: any) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);

  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const userDirectoryPath = (
  subFolder: 'images' | 'models' | 'avatars' | 'banners',
) => {
  return (req: any, file: any, cb: any) => {
    console.log('DEBUG: destination function started');
    try {
      const userId = req.user?.userId || 'unknown';
      const path = `./media/user_${userId}/${subFolder}`;

      console.log('before mkdir');
      fs.mkdir(path, { recursive: true }, (e) => {
        console.log('before cb1');
        if (e) {
          console.error('Directory creation error:', e);
          cb(e, null);
        }
        console.log('before cb2');
        cb(null, path);
      });
    } catch (err) {
      console.error('DEBUG: Crash inside userDirectoryPath', err);
      cb(err, null);
    }
  };
};
