import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * 数据库初始化服务
 * 在应用启动后设置数据库会话时区
 */
@Injectable()
export class DatabaseInitService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    // 确保数据库连接使用东八区时区
    // 注意：TypeORM 的 timezone 选项应该已经设置了，这里作为额外保障
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query("SET time_zone = '+08:00'");
        console.log('✓ 数据库会话时区已设置为东八区 (UTC+8)');
      }
    } catch (error) {
      console.error('✗ 设置数据库时区失败:', error);
    }
  }
}
