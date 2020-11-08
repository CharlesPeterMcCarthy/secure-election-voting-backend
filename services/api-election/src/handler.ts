import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { ElectionController } from './election.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: ElectionController = new ElectionController(unitOfWork);

export const getElectionById: ApiHandler = controller.getElectionById;
export const getAllElections: ApiHandler = controller.getAllElections;
export const getAllUpcomingElections: ApiHandler = controller.getAllUpcomingElections;
export const getAllFinishedElections: ApiHandler = controller.getAllFinishedElections;
export const getCurrentElections: ApiHandler = controller.getCurrentElections;
export const getAllElectionsUnregisteredByUser: ApiHandler = controller.getAllElectionsUnregisteredByUser;
export const getAllElectionsRegisteredByUser: ApiHandler = controller.getAllElectionsRegisteredByUser;
export const registerForElection: ApiHandler = controller.registerForElection;
export const unregisterForElection: ApiHandler = controller.unregisterForElection;
export const getNonVotedElections: ApiHandler = controller.getNonVotedElections;
export const startElection: ApiHandler = controller.startElection;
export const finishElection: ApiHandler = controller.finishElection;
export const createElection: ApiHandler = controller.createElection;
export const updateElection: ApiHandler = controller.updateElection;
export const deleteElection: ApiHandler = controller.deleteElection;
