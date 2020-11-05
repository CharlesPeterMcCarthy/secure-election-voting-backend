import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { CandidateDetails, Vote } from '../../types';

export class VoteItem extends DynamoDbItem implements Vote {

	@attribute()
	public voteId!: string;

	@attribute()
	public ballotId!: string;

	@attribute()
	public candidate!: CandidateDetails;

	@attribute()
	public times: {
		createdAt: Date | string;
	};

}
