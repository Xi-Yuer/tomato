import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('未授权访问');
    }

    // 查询用户信息，验证是否为管理员
    const userInfo = await this.usersService.findOne(user.userId);

    if (!userInfo.isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    return true;
  }
}
