import { Module, Global } from '@nestjs/common';
import { MinioService } from './services/minio.service';
import { DatabaseInitService } from './services/database-init.service';

@Global()
@Module({
  providers: [MinioService, DatabaseInitService],
  exports: [MinioService],
})
export class CommonModule {}
