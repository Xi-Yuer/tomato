import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MinioService } from '../common/services/minio.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly minioService: MinioService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: { user: JwtPayload }) {
    return this.usersService.findOne(req.user.userId);
  }

  @Patch('profile/me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Request() req: { user: JwtPayload },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  /**
   * 上传用户头像
   * @param req 请求对象（包含当前登录用户信息）
   * @param file 上传的头像文件
   * @returns 上传后的头像URL
   * @description 用户上传头像，文件会保存到 MinIO 存储
   */
  @Post('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              '只允许上传图片文件（jpg, png, gif, webp）',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadAvatar(
    @Request() req: { user: JwtPayload },
    @UploadedFile()
    file: {
      buffer: Buffer;
      size: number;
      mimetype: string;
      originalname: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('请上传头像文件');
    }

    try {
      // 上传到 MinIO
      const fileExt = file.originalname.split('.').pop();
      const avatarUrl = await this.minioService.uploadFile(
        file,
        `avatars/${req.user.userId}_${Date.now()}.${fileExt}`,
      );

      // 更新用户头像
      const updatedUser = await this.usersService.updateProfile(
        req.user.userId,
        { avatar: avatarUrl },
      );

      return {
        message: '头像上传成功',
        avatar: avatarUrl,
        user: updatedUser,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new BadRequestException(`头像上传失败: ${errorMessage}`);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
