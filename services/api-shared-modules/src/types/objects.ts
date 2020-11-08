export enum UserType {
	VOTER = 'VOTER',
	ADMIN = 'ADMIN'
}

export interface DBItem {
	pk: string;
	sk: string;
	sk2?: string;
	sk3?: string;
	entity: string;
}

export interface CandidateDetails {
	candidateId: string;
	electionId: string;
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
		createdAt: string;
		lastLogin?: string;
	};
}

export interface Candidate extends DBItem, CandidateDetails {
	createdBy: {
		userId: string;
		firstName: string;
		lastName: string;
	};
	times: {
		createdAt: string;
		updatedAt?: string;
	};
}

export interface BallotPaper extends DBItem {
	ballotPaperId: string;
	electionId: string;
	userId: string;
	electionName: string;
	candidates: CandidateDetails[];
	voted: boolean;
	vote?: CandidateDetails;
	voteCandidateId?: string;
	times: {
		createdAt: string;
		submittedVoteAt?: string;
	};
}

export interface Election extends DBItem {
	electionId: string;
	electionName: string;
	createdBy: {
		userId: string;
		firstName: string;
		lastName: string;
	};
	candidates: CandidateDetails[];
	winner?: CandidateDetails;
	electionStarted: boolean;
	electionFinished: boolean;
	times: {
		createdAt: string;
		startedAt?: string;
		endedAt?: string;
	}
}
