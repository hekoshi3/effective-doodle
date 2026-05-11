import { Global, Module } from '@nestjs/common';
import { MediaService } from './media/media.service';

@Global()
@Module({
  providers: [MediaService],
  exports: [MediaService],
})
export class CommonModule {}
