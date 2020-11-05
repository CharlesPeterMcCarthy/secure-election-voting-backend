import { ApiHandler } from '../../api-shared-modules/src';
import { InfrastructureController } from './infrastructure.controller';

const controller: InfrastructureController = new InfrastructureController();

export const health: ApiHandler = controller.health;
