import { Controller, Get } from '@nestjs/common';
import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  async getModels() {
    return this.modelsService.findAll();
  }
}

@Controller('config/model-types/')
export class ModelTypes {
  @Get()
  getModelTypes() {
    return [
      {
        value: 'LORA',
        label: 'LoRA',
      },
      {
        value: 'CHECKPOINT',
        label: 'Checkpoint',
      },
      {
        value: 'EMBEDDING',
        label: 'Embedding',
      },
      {
        value: 'UPSCALER',
        label: 'Upscaler',
      },
      {
        value: 'CONTROLNET',
        label: 'ControlNet',
      },
    ];
  }
}
