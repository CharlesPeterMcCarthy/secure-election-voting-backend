import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { CandidateDetails, Election, WinnerDetails } from '../../types';

export class ElectionItem extends DynamoDbItem implements Election {

	@attribute()
	public electionId!: string;

	@attribute()
	public electionName!: string;

	@attribute()
	public createdBy!: {
		userId: string;
		firstName: string;
		lastName: string;
	};

	@attribute()
	public candidates!: CandidateDetails[];

	@attribute()
	public winner?: WinnerDetails;

	@attribute()
	public electionStarted!: boolean;

	@attribute()
	public electionFinished!: boolean;

	@attribute()
	public times: {
		createdAt: string;
		startedAt?: string;
		endedAt?: string;
	};

}
