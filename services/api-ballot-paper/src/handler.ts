import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { BallotPaperController } from './ballot-paper.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: BallotPaperController = new BallotPaperController(unitOfWork);

export const getBallotPaperById: ApiHandler = controller.getBallotPaperById;
export const getAllBallotPapersByElection: ApiHandler = controller.getAllBallotPapersByElection;
export const getBallotPaperByElectionVoter: ApiHandler = controller.getBallotPaperByElectionVoter;
export const getAllBallotPapersByCandidate: ApiHandler = controller.getAllBallotPapersByCandidate;
export const createBallotPaper: ApiHandler = controller.createBallotPaper;
export const submitBallotPaper: ApiHandler = controller.submitBallotPaper;
