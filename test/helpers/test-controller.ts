import {
  Controller,
  Get,
  Query,
  Body,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { AuditLog } from '../../src';
import { TestGuard } from './test.guard';
import { UseGuards } from '@nestjs/common';

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

  @AuditLog({
    resource_id: '1',
    resource_type: 'Cat',
    operator_id: 'createTheCat',
    operator_type: 'Create',
  })
  @Post('fixed')
  createCatFixedId(): any {
    return `Congratulations! You created the cat 1!`;
  }

  @AuditLog({
    resource_type: 'Cat',
    operator_id: 'createTheCat',
    operator_type: 'Create',
  })
  @Post('unknown')
  createCatUnknowId(): any {
    return `Congratulations! You created the cat unknown!`;
  }

  @AuditLog({
    resource_type: 'Cat',
    actor_id_field_map: 'body.username',
    actor_type_field_map: 'body.role',
    operator_id: 'createTheCat',
    operator_type: 'Create',
  })
  @Post('actor/actor_id_field_map')
  createCatWithActor(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLog({
    resource_type: 'Cat',
    operator_id: 'createTheCat',
    operator_type: 'Create',
  })
  @UseGuards(TestGuard)
  @Post('actor/guard')
  createCatWithGuard(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }
}
