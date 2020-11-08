import { BallotPaper, Candidate } from '../../api-shared-modules/src/types';

export interface CreateBallotPaperRequest {
	electionId: string;
	userId: string;
}

export interface SubmitBallotPaperRequest {
	ballotPaper: BallotPaper;
	candidate: Candidate;
	userId: string;
}
