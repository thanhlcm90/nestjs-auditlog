import {
  Controller,
  Get,
  Query,
  Body,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { AuditLog } from '../../src';

@Controller('/')
export class CatsController {
  @AuditLog({
    resource_type: 'Cat',
    resource_id_field_map: 'query.id',
    operator_id: 'findTheCat',
    operator_type: 'Query',
  })
  @Get()
  findTheCat(@Query('id') id: string): any {
    return `Congratulations! You have found the cat ${id}!`;
  }

  @AuditLog({
    resource_type: 'Cat',
    resource_id_field_map: 'body.id',
    operator_id: 'createTheCat',
    operator_type: 'Create',
  })
  @Post()
  createTheCat(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLog({
    resource_type: 'Cat',
    operator_id: 'createTheCat',
    operator_type: 'Create',
  })
  @Post('another')
  createAnotherCat(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @Get('no-audit')
  findTheCatNoAudit(@Query('id') id: string): any {
    return `Congratulations! You have found the cat ${id}!`;
  }

  @AuditLog({
    resource_type: 'Cat',
    resource_id_field_map: 'query.id',
    operator_id: 'findTheCat',
    operator_type: 'Query',
  })
  @Get('failed')
  findTheCatFailed(): any {
    throw new BadRequestException();
  }
}
