import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Candidate } from '../../types';

export class CandidateItem extends DynamoDbItem implements Candidate {

	@attribute()
	public candidateId!: string;

	@attribute()
	public electionId!: string;

	@attribute()
	public firstName!: string;

	@attribute()
	public lastName!: string;

	@attribute()
	public party!: string;

	@attribute()
	public createdBy!: {
		userId: string;
		firstName: string;
		lastName: string;
	};

	@attribute()
	public times: {
		createdAt: string;
		updatedAt?: string;
	};

}
