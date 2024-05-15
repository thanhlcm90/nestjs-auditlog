import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TestGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = {
      id: 'daniel',
      role: 'admin',
    };
    return true;
  }
}
