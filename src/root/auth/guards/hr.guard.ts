import { UserRole } from '@/enums/user.enum';
import type { RequestWithUser } from '@/types/request.interface';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class HrGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role !== UserRole.HR) {
      throw new ForbiddenException('Access denied. HR role required.');
    }

    return true;
  }
}
