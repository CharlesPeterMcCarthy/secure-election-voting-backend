import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { BallotPaper, CandidateDetails } from '../../types';

export class BallotPaperItem extends DynamoDbItem implements BallotPaper {

	@attribute()
	public ballotId!: string;

	@attribute()
	public userId!: string;

	@attribute()
	public candidates!: CandidateDetails[];

	@attribute()
	public vote?: CandidateDetails;

	@attribute()
	public times: {
		createdAt: string;
		submittedVoteAt: string;
	};

}
