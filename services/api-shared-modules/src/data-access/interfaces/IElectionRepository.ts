import { Election, LastEvaluatedKey } from '../..';

export interface IElectionRepository {
	get(electionId: string): Promise<Election>;
	getAll(electionStarted?: boolean, electionFinished?: boolean, lastEvaluatedKey?: LastEvaluatedKey):
		Promise<{ elections: Election[]; lastEvaluatedKey: LastEvaluatedKey }>;
	create(election: Partial<Election>): Promise<Election>;
	update(election: Election): Promise<Election>;
	delete(electionId: string): Promise<Election | undefined>;
}
