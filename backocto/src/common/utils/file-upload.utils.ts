/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { existsSync, mkdirSync } from 'fs';
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
  subFolder: 'images' | 'models' | 'avatars',
) => {
  return (req: any, cb: any) => {
    const userId = req.user.userId || 'unknown';
    const path = `./media/${subFolder}/user_${userId}`;

    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
    cb(null, path);
  };
};
