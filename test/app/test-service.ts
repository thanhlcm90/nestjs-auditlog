import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  public readonly age = 10_000;
}
