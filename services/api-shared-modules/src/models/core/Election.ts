import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { CandidateDetails, Election } from '../../types';

export class ElectionItem extends DynamoDbItem implements Election {

	@attribute()
	public electionId!: string;

	@attribute()
	public createdBy!: {
		userId: string;
		firstName: string;
		lastName: string;
	};

	@attribute()
	public candidates!: CandidateDetails[];

	@attribute()
	public winner!: CandidateDetails;

	@attribute()
	public times: {
		createdAt: string;
		startedAt?: string;
		endedAt?: string;
	};

}
