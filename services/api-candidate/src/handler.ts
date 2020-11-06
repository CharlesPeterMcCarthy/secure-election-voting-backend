import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { CandidateController } from './candidate.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: CandidateController = new CandidateController(unitOfWork);

export const getCandidateById: ApiHandler = controller.getCandidateById;
export const getAllCandidates: ApiHandler = controller.getAllCandidates;
export const getAllCandidatesByElection: ApiHandler = controller.getAllCandidatesByElection;
export const createCandidate: ApiHandler = controller.createCandidate;
export const updateCandidate: ApiHandler = controller.updateCandidate;
export const deleteCandidate: ApiHandler = controller.deleteCandidate;
