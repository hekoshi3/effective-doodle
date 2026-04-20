import { Controller, Get } from '@nestjs/common';
import { AiModelType } from '../generated/prisma/enums';

@Controller('config')
export class ConfigController {
  @Get('model-types/')
  getModelTypes() {
    return Object.values(AiModelType).map((type) => ({
      value: type,
      label: this.formatLabel(type),
    }));
  }

  private formatLabel(type: string): string {
    const labels: Record<string, string> = {
      [AiModelType.LORA]: 'LoRA',
      [AiModelType.CHECKPOINT]: 'Checkpoint',
      [AiModelType.EMBEDDING]: 'Embedding',
      [AiModelType.UPSCALER]: 'Upscaler',
      [AiModelType.CONTROLNET]: 'ControlNet',
    };
    return labels[type] || type;
  }
}
