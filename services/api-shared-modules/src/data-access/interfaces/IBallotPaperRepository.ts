import { BallotPaper, LastEvaluatedKey } from '../..';

export interface IBallotPaperRepository {
	get(ballotPaperId: string, userId: string): Promise<BallotPaper>;
	getAllByElection(electionId: string, lastEvaluatedKey?:
		LastEvaluatedKey): Promise<{ ballotPapers: BallotPaper[]; lastEvaluatedKey: LastEvaluatedKey }>;
	getAllByElectionVoter(userId: string, electionId: string, lastEvaluatedKey?:
		LastEvaluatedKey): Promise<{ ballotPapers: BallotPaper[]; lastEvaluatedKey: LastEvaluatedKey }>;
	getAllByVoter(userId: string, voted?: boolean, lastEvaluatedKey?:
		LastEvaluatedKey): Promise<{ ballotPapers: BallotPaper[]; lastEvaluatedKey: LastEvaluatedKey }>;
	getAllByElectionCandidate(electionId: string, candidateId: string, lastEvaluatedKey?:
		LastEvaluatedKey): Promise<{ ballotPapers: BallotPaper[]; lastEvaluatedKey: LastEvaluatedKey }>;
	create(ballotPaper: Partial<BallotPaper>): Promise<BallotPaper>;
	update(ballotPaper: BallotPaper): Promise<BallotPaper>;
	delete(ballotPaperId: string, userId: string): Promise<BallotPaper | undefined>;
}
