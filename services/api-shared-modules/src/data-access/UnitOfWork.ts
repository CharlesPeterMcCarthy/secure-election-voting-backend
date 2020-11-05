import { BallotPaperRepository, CandidateRepository, ElectionRepository, UserRepository } from './repositories';
import { IUserRepository, IElectionRepository, IBallotPaperRepository, ICandidateRepository } from './interfaces';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';

export class UnitOfWork {

	public BallotPapers: IBallotPaperRepository;
	public Candidates: ICandidateRepository;
	public Elections: IElectionRepository;
	public Users: IUserRepository;

	public constructor() {
		const db: DataMapper = new DataMapper({ client: new DynamoDB({ region: 'eu-west-1' }) });

		this.BallotPapers = new BallotPaperRepository(db);
		this.Candidates = new CandidateRepository(db);
		this.Elections = new ElectionRepository(db);
		this.Users = new UserRepository(db);
	}

}
