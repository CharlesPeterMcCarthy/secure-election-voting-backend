import { Candidate, LastEvaluatedKey } from '../..';

export interface ICandidateRepository {
	get(candidateId: string, electionId: string): Promise<Candidate>;
	getAll(lastEvaluatedKey?: LastEvaluatedKey): Promise<{ candidates: Candidate[]; lastEvaluatedKey: LastEvaluatedKey }>;
	getAllByElection(electionId: string, lastEvaluatedKey?:
		LastEvaluatedKey): Promise<{ candidates: Candidate[]; lastEvaluatedKey: LastEvaluatedKey }>;
	create(candidate: Partial<Candidate>): Promise<Candidate>;
	update(candidate: Candidate): Promise<Candidate>;
	delete(candidateId: string, electionId: string): Promise<Candidate | undefined>;
}
