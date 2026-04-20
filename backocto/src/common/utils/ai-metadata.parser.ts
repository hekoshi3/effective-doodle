/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import sharp from 'sharp';

export interface AIParams {
  prompt?: string;
  negative_prompt?: string;
  steps?: string;
  sampler?: string;
  cfg_scale?: string;
  seed?: string;
  width?: number;
  height?: number;
  [key: string]: string | number | undefined;
}

export const extractAIMetadata = async (
  filePath: string,
): Promise<AIParams> => {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    const rawParams = (metadata as any).text?.parameters || '';

    const result: any = {
      width: metadata.width,
      height: metadata.height,
    };

    if (rawParams) {
      const parts = rawParams.split('\n');
      result.prompt = parts[0];

      const negativeMatch = rawParams.match(/Negative prompt: (.*)/);
      if (negativeMatch) result.negative_prompt = negativeMatch[1];

      const settingsLine = rawParams.match(/Steps: (.*)/);
      if (settingsLine) {
        const pairs = settingsLine.split(', ');
        pairs.forEach((pair) => {
          const [key, val] = pair.split(': ');
          if (key && val) {
            const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
            result[normalizedKey] = val.trim();
          }
        });
      }
    }

    return result;
  } catch {
    return {};
  }
};
