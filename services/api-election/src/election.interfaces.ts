import { Election } from '../../api-shared-modules/src/types';

export interface CreateElectionRequest {
	electionName: string;
	adminId: string;
}

export interface UpdateElectionRequest {
	election: Election;
	adminId: string;
}
