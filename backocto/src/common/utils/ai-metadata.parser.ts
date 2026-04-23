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
  [key: string]: any;
}

export const extractAIMetadata = async (
  filePath: string,
): Promise<AIParams> => {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    const textMetadata = (metadata as any).comments || {};
    const raw: string =
      textMetadata.parameters ||
      textMetadata[0].text ||
      textMetadata.prompt ||
      '';
    const result: any = {
      raw: raw,
      real_width: metadata.width,
      real_height: metadata.height,
    };

    if (raw) {
      const parts = raw.split('Steps: ');
      const promptPart = parts[0];
      const paramPart = parts.length > 1 ? 'Steps: ' + parts[1] : '';

      if (promptPart.includes('Negative prompt:')) {
        const pSplit = promptPart.split('Negative prompt:');
        result.prompt = pSplit[0].trim();
        result.negative_prompt = pSplit[1].trim();
      } else {
        result.prompt = promptPart.trim();
        result.negative_prompt = '';
      }

      if (paramPart) {
        const regex = /\b([\w\s]+):\s*(.*?)(?=(?:\s*,\s*[\w\s]+:|$))/g;

        let match;
        while ((match = regex.exec(paramPart)) !== null) {
          const key = match[0]
            .trim()
            .toLowerCase()
            .split(':')[0]
            .replace(/\s+/g, '_');
          let value = match[2].trim();

          if (value.endsWith(',')) value = value.slice(0, -1);

          result[key] = value;
        }

        if (result.size && typeof result.size === 'string') {
          const [w, h]: string = result.size.split('x');
          result.width = parseInt(w) || result.width;
          result.height = parseInt(h) || result.height;
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Sharp Metadata Error: ', error);
    return {};
  }
};
