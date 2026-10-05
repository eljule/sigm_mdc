import { Controller, Get } from '@nestjs/common';
import { HelpdeskMetricsUseCase } from '../../application/use-cases/helpdesk-metrics.use-case';

@Controller('api/v1/helpdesk/metrics')
export class HelpdeskMetricsController {
  constructor(private readonly metricsUseCase: HelpdeskMetricsUseCase) {}

  @Get()
  async getMetrics() {
    const data = await this.metricsUseCase.getMetrics();
    return {
      success: true,
      message: 'Métricas e indicadores de Helpdesk obtenidos',
      data,
    };
  }
}
