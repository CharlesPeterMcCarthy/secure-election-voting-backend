import { Election } from '../../api-shared-modules/src/types';

export interface CreateElectionRequest {
	electionName: string;
	userId: string;
}

export interface UpdateElectionRequest {
	election: Election;
	adminId: string;
}

export interface RegisterForElectionRequest {
	userId: string;
	electionId: string;
}
