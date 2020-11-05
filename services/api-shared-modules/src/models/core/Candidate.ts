import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Candidate } from '../../types';

export class CandidateItem extends DynamoDbItem implements Candidate {

	@attribute()
	public candidateId!: string;

	@attribute()
	public firstName!: string;

	@attribute()
	public lastName!: string;

	@attribute()
	public party!: string;

	@attribute()
	public times: {
		createdAt: Date | string;
	};

}
