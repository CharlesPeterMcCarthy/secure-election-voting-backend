import { UserRepository } from './repositories';
import { IUserRepository } from './interfaces';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';

export class UnitOfWork {

	public Users: IUserRepository;

	public constructor() {
		const db: DataMapper = new DataMapper({ client: new DynamoDB({ region: 'eu-west-1' }) });

		this.Users = new UserRepository(db);
	}

}
