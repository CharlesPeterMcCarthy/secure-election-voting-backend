import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { ElectionController } from './election.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: ElectionController = new ElectionController(unitOfWork);

export const getElectionById: ApiHandler = controller.getElectionById;
export const getAllElections: ApiHandler = controller.getAllElections;
export const createElection: ApiHandler = controller.createElection;
export const updateElection: ApiHandler = controller.updateElection;
export const deleteElection: ApiHandler = controller.deleteElection;
