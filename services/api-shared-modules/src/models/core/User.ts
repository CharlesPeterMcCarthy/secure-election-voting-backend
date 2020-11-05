import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { User, UserType } from '../../types';

export class UserItem extends DynamoDbItem implements User {

	@attribute()
	public userId!: string;

	@attribute()
	public email!: string;

	@attribute()
	public firstName!: string;

	@attribute()
	public lastName!: string;

	@attribute()
	public userType!: UserType;

	@attribute()
	public confirmed!: boolean;

	@attribute()
	public times: {
		confirmedAt?: string;
		createdAt: string;
		lastLogin?: string;
	};

}
