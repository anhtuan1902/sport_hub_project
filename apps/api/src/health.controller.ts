import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('api/v1')
  @ApiOperation({ summary: 'API info' })
  apiInfo() {
    return {
      name: 'Sport Hub API',
      version: '1.0.0',
      description: 'Ứng dụng đặt sân thể thao',
      documentation: '/docs',
    };
  }
}
