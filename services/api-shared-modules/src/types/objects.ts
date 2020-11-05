export type UserType = 'Voter' | 'Admin';

export interface DBItem {
	pk: string;
	sk: string;
	sk2?: string;
	sk3?: string;
	entity: string;
}

export interface CandidateDetails {
	candidateId: string;
	firstName: string;
	lastName: string;
	party: string;
}

export interface User extends DBItem {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	userType: UserType;
	confirmed: boolean;
	times: {
		confirmedAt?: string;
		createdAt: Date | string;
		lastLogin?: Date | string;
	}
}

export interface Candidate extends DBItem, CandidateDetails {
	times: {
		createdAt: Date | string;
	}
}

export interface BallotPaper extends DBItem {
	ballotId: string;
	times: {
		createdAt: Date | string;
		submittedVoteAt: Date | string;
	}
}

export interface Vote extends DBItem {
	voteId: string;
	ballotId: string;
	candidate: CandidateDetails;
	times: {
		createdAt: Date | string;
	}
}
