import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { BallotPaper, CandidateDetails } from '../../types';

export class BallotPaperItem extends DynamoDbItem implements BallotPaper {

	@attribute()
	public ballotPaperId!: string;

	@attribute()
	public electionId!: string;

	@attribute()
	public userId!: string;

	@attribute()
	public electionName!: string;

	@attribute()
	public candidates!: CandidateDetails[];

	@attribute()
	public voted: boolean;

	@attribute()
	public vote?: CandidateDetails;

	@attribute()
	public voteCandidateId?: string;

	@attribute()
	public times: {
		createdAt: string;
		submittedVoteAt?: string;
	};

}
