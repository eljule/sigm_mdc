import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ManageLoansUseCase } from '../../application/use-cases/manage-loans.use-case';
import { CreateAssetLoanDto, ReturnAssetLoanDto } from '../../application/dtos/itam-extended.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller('api/v1/itam/loans')
export class ItamLoansController {
  constructor(private readonly manageLoansUseCase: ManageLoansUseCase) {}

  @Get()
  async list(@Query('status') status?: string) {
    const list = await this.manageLoansUseCase.listLoans(status);
    return ApiResponseDto.ok(list, 'Préstamos y reservas temporales obtenidos');
  }

  @Get('alerts/delayed')
  async getDelayedLoans() {
    const list = await this.manageLoansUseCase.getDelayedLoans();
    return ApiResponseDto.ok(list, 'Préstamos con retraso en la devolución');
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const item = await this.manageLoansUseCase.getLoanById(id);
    return ApiResponseDto.ok(item, 'Detalle de préstamo / acta obtenido');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createLoan(@Body() dto: CreateAssetLoanDto) {
    const item = await this.manageLoansUseCase.createLoan(dto);
    return ApiResponseDto.ok(item, 'Préstamo registrado y acta de salida generada con éxito');
  }

  @Post(':id/return')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async returnLoan(@Param('id') id: string, @Body() dto: ReturnAssetLoanDto) {
    const item = await this.manageLoansUseCase.returnLoan(id, dto);
    return ApiResponseDto.ok(item, 'Retorno de préstamo procesado y equipos restablecidos a operativo');
  }
}
