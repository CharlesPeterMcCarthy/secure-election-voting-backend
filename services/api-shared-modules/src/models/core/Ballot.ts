import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { BallotPaper } from '../../types';

export class BallotPaperItem extends DynamoDbItem implements BallotPaper {

	@attribute()
	public ballotId!: string;

	@attribute()
	public times: {
		createdAt: Date | string;
		submittedVoteAt: Date | string;
	};

}
