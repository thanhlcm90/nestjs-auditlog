import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import {
  AuditLog,
  AuditLogCreate,
  AuditLogDataDiff,
  AuditLogDataDiffCallback,
  AuditLogQuery,
  AuditLogRemove,
  AuditLogUpdate,
} from '../../src';

@Controller('/')
export class TestController {
  constructor() {}

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'findTheCat',
      type: 'Query',
    },
    resource_id_field_map: 'query.id',
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
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'findTheCat',
      type: 'Query',
    },
    resource_id_field_map: 'query.id',
  })
  @Get('failed')
  findTheCatFailed(): any {
    throw new BadRequestException();
  }

  @Get('failed-no-audit')
  findTheCatFailedNoAudit(): any {
    throw new BadRequestException();
  }

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'createTheCat',
      type: 'Create',
    },
    resource_id_field_map: 'body.id',
  })
  @Post()
  createTheCat(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'createTheCat',
      type: 'Create',
    },
    resource_id_field_map: 'params.id',
  })
  @Post('create/:id')
  createTheCatByParam(@Param('id') id: string): any {
    return `Congratulations! You created the cat ${id}!`;
  }

  @AuditLog()
  @Post('default1')
  createTheCatDefault1(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLog({
    resource: {},
    operation: {},
    actor: {},
  })
  @Post('default2')
  createTheCatDefault2(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLog({
    resource: {},
    operation: {
      id: null,
    },
    actor: {},
  })
  @Post('default3')
  createTheCatDefault3(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'createTheCat',
      type: 'Create',
    },
  })
  @Post('another')
  createAnotherCat(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLog({
    resource: {
      id: '1',
      type: 'Cat',
    },
    operation: {
      id: 'createTheCat',
      type: 'Create',
    },
  })
  @Post('fixed')
  createCatFixedId(): any {
    return `Congratulations! You created the cat 1!`;
  }

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'createTheCat',
      type: 'Create',
    },
  })
  @Post('unknown')
  createCatUnknowId(): any {
    return `Congratulations! You created the cat unknown!`;
  }

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'createTheCat',
      type: 'Create',
    },
    actor_id_field_map: 'body.username',
    actor_type_field_map: 'body.role',
  })
  @Post('actor/actor_id_field_map')
  createCatWithActor(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLogCreate()
  @Post('default/create1')
  createTheCatWithAuditLogCreate1(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLogCreate({
    operation: {
      id: 'createTheCatWithAuditLogCreate2',
    },
  })
  @Post('default/create2')
  createTheCatWithAuditLogCreate2(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLogUpdate()
  @Post('default/update1')
  createTheCatWithAuditLogUpdate1(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLogUpdate({
    operation: {
      id: 'createTheCatWithAuditLogUpdate2',
    },
  })
  @Post('default/update2')
  createTheCatWithAuditLogUpdate2(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLogRemove()
  @Post('default/remove1')
  createTheCatWithAuditLogRemove1(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLogRemove({
    operation: {
      id: 'createTheCatWithAuditLogRemove2',
    },
  })
  @Post('default/remove2')
  createTheCatWithAuditLogRemove2(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLogQuery()
  @Post('default/query1')
  createTheCatWithAuditLogQuery1(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLogQuery({
    operation: {
      id: 'createTheCatWithAuditLogQuery2',
    },
  })
  @Post('default/query2')
  createTheCatWithAuditLogQuery2(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'createTheCat',
      type: 'Create',
    },
    resource_id_field_map: '$response.id',
    actor_id_field_map: '$response.id',
    actor_type_field_map: '$response.role',
  })
  @Post('map-response')
  createTheCatMapResponse(): any {
    return {
      id: '2',
      role: 'admin',
    };
  }

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'createTheCat',
      type: 'Create',
    },
  })
  @Post('array-id')
  createTheCatArrayId(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id.join(',')}!`;
  }

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'createTheCat',
      type: 'Create',
    },
    actor_id_field_map: 'body.username',
    actor_type_field_map: 'body.role',
  })
  @Get('compare-data')
  async createTheCatWithCompareData(
    @AuditLogDataDiff() dataDiff: AuditLogDataDiffCallback
  ) {
    dataDiff(
      {
        name: 'test1',
      },
      {
        name: 'test2',
      }
    );
    return `Congratulations! You created the cat!`;
  }
}
