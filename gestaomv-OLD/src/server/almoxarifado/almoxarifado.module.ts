import { Module } from '@nestjs/common';
import { MateriaisService } from './materiais.service';
import { SolicitacoesService } from './solicitacoes.service';
import { EstatisticasService } from './estatisticas.service';
import { AlmoxarifadoRouter } from './almoxarifado.router';

@Module({
  providers: [MateriaisService, SolicitacoesService, EstatisticasService, AlmoxarifadoRouter],
  exports: [MateriaisService, SolicitacoesService, EstatisticasService, AlmoxarifadoRouter],
})
export class AlmoxarifadoModule {}
