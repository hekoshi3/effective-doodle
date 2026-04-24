import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';

export const editFileName = (
  file: { originalname: string },
  callback: (arg0: null, arg1: string) => void,
) => {
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
  return (
    req: { user: { userId: string } },
    cb: (arg0: null, arg1: string) => void,
  ) => {
    const userId = req.user.userId || 'unknown';
    const path = `./media/${subFolder}/user_${userId}`;

    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
    cb(null, path);
  };
};
