import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as MinIO from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: MinIO.Client;
  private bucketName: string;

  constructor() {
    this.minioClient = new MinIO.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    this.bucketName = process.env.MINIO_BUCKET_NAME || 'tomato-manager';
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  /**
   * 确保存储桶存在，如果不存在则创建
   */
  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`存储桶 ${this.bucketName} 创建成功`);
      }
    } catch (error) {
      this.logger.error(`创建存储桶失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 上传文件到 MinIO
   * @param file 文件对象
   * @param objectName 对象名称（路径）
   * @returns 文件URL
   */
  async uploadFile(
    file: {
      buffer: Buffer;
      size: number;
      mimetype: string;
      originalname: string;
    },
    objectName: string,
  ): Promise<string> {
    try {
      const metaData = {
        'Content-Type': file.mimetype,
        'Original-Name': file.originalname,
      };

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        metaData,
      );

      // 生成文件访问URL
      const url = await this.getFileUrl(objectName);
      return url;
    } catch (error) {
      this.logger.error(`上传文件失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 上传多个文件
   * @param files 文件数组
   * @param folder 文件夹路径（可选）
   * @returns 文件URL数组
   */
  async uploadFiles(
    files: Array<{
      buffer: Buffer;
      size: number;
      mimetype: string;
      originalname: string;
    }>,
    folder: string = 'tasks',
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const ext = file.originalname.split('.').pop();
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      const objectName = `${folder}/${randomName}.${ext}`;
      return this.uploadFile(file, objectName);
    });

    return await Promise.all(uploadPromises);
  }

  /**
   * 获取文件访问URL（预签名URL，有效期7天）
   * @param objectName 对象名称
   * @param expiry 过期时间（秒），默认7天
   * @returns 文件URL
   */
  async getFileUrl(
    objectName: string,
    expiry: number = 7 * 24 * 60 * 60,
  ): Promise<string> {
    try {
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expiry,
      );
      return url;
    } catch (error) {
      this.logger.error(`获取文件URL失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取公共访问URL（如果存储桶是公共的）
   * @param objectName 对象名称
   * @returns 文件URL
   */
  getPublicUrl(objectName: string): string {
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT
      ? parseInt(process.env.MINIO_PORT)
      : 9000;
    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${objectName}`;
  }

  /**
   * 删除文件
   * @param objectName 对象名称
   */
  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.error(`删除文件失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除多个文件
   * @param objectNames 对象名称数组
   */
  async deleteFiles(objectNames: string[]): Promise<void> {
    try {
      await this.minioClient.removeObjects(this.bucketName, objectNames);
    } catch (error) {
      this.logger.error(`删除文件失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
