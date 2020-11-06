import { Candidate } from '../../api-shared-modules/src/types';

export interface CreateCandidateRequest {
	electionId: string;
	firstName: string;
	lastName: string;
	party: string;
}

export interface UpdateCandidateRequest extends Candidate { }
