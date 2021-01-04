import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	LastEvaluatedKey,
	Election, BallotPaper, User, CandidateDetails
} from '../../api-shared-modules/src';
import { ElectionItem } from '../../api-shared-modules/src/models/core/Election';
import { CreateElectionRequest, RegisterForElectionRequest, UpdateElectionRequest } from './election.interfaces';
import { BallotPaperController } from '../../api-ballot-paper/src/ballot-paper.controller';

export class ElectionController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getElectionById: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters - Election ID is missing');

		const electionId: string = event.pathParameters.electionId;

		try {
			const election: Election = await this.unitOfWork.Elections.get(electionId);

			return ResponseBuilder.ok({ election });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Election not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllElections: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { elections: Election[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.Elections.getAll(undefined, undefined, lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Elections');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllUpcomingElections: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { elections: Election[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.Elections.getAll(false, false, lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Elections');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllFinishedElections: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { elections: Election[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.Elections.getAll(true, true, lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Elections');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getCurrentElections: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { elections: Election[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.Elections.getAll(true, false, lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Elections');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllElectionsUnregisteredByUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId || !event.pathParameters.upcoming)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const userId: string = event.pathParameters.userId;
		const upcoming: boolean = event.pathParameters.upcoming === 'true';

		try {
			const electionsResponse: { elections: Election[] } =
				upcoming ? await this.unitOfWork.Elections.getAll(false, false) :
				await this.unitOfWork.Elections.getAll(undefined, undefined);
			const ballotPapersResponse: { ballotPapers: BallotPaper[] } = await this.unitOfWork.BallotPapers.getAllByVoter(userId);
			const ballotPaperElectionIds: string[] = ballotPapersResponse.ballotPapers.map((bp: BallotPaper) => bp.electionId);
			const unregisteredElections: Election[] =
				electionsResponse.elections.filter((e: Election) => !ballotPaperElectionIds.includes(e.electionId));

			return ResponseBuilder.ok({ elections: unregisteredElections });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllElectionsRegisteredByUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId || !event.pathParameters.upcoming)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const userId: string = event.pathParameters.userId;
		const upcoming: boolean = event.pathParameters.upcoming === 'true';

		try {
			const electionsResponse: { elections: Election[] } =
				upcoming ? await this.unitOfWork.Elections.getAll(false, false) :
					await this.unitOfWork.Elections.getAll(undefined, undefined);
			const ballotPapersResponse: { ballotPapers: BallotPaper[] } = await this.unitOfWork.BallotPapers.getAllByVoter(userId, false);
			const ballotPaperElectionIds: string[] = ballotPapersResponse.ballotPapers.map((bp: BallotPaper) => bp.electionId);
			const registeredElections: Election[] =
				electionsResponse.elections.filter((e: Election) => ballotPaperElectionIds.includes(e.electionId));

			return ResponseBuilder.ok({ elections: registeredElections });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public registerForElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: RegisterForElectionRequest = JSON.parse(event.body);

		if (!data.electionId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election ID is missing');
		if (!data.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'User ID is missing');

		try {
			const ballotPaperController: BallotPaperController = new BallotPaperController(this.unitOfWork);
			const ballotPaper: BallotPaper = await ballotPaperController.createBallot(data.userId, data.electionId);

			return ResponseBuilder.ok({ ballotPaper });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public unregisterForElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: RegisterForElectionRequest = JSON.parse(event.body);

		if (!data.electionId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election ID is missing');
		if (!data.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'User ID is missing');

		try {
			const ballotPaper: BallotPaper = await this.unitOfWork.BallotPapers.getByElectionVoter(data.userId, data.electionId);
			const deletedBallotPaper: BallotPaper = await this.unitOfWork.BallotPapers.delete(ballotPaper.ballotPaperId, ballotPaper.userId);

			return ResponseBuilder.ok({ ballotPaper: deletedBallotPaper });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getVotedElections: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const userId: string = event.pathParameters.userId;

		try {
			const electionsResponse: { elections: Election[] } = await this.unitOfWork.Elections.getAll(undefined, undefined);
			const ballotPapersResponse: { ballotPapers: BallotPaper[] } = await this.unitOfWork.BallotPapers.getAllByVoter(userId, true);
			const ballotPaperElectionIds: string[] = ballotPapersResponse.ballotPapers
				.filter((bp: BallotPaper) => bp.voted)
				.map((bp: BallotPaper) => bp.electionId);
			const votedElections: Election[] =
				electionsResponse.elections.filter((e: Election) => ballotPaperElectionIds.includes(e.electionId));

			return ResponseBuilder.ok({ elections: votedElections });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getNonVotedElections: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const userId: string = event.pathParameters.userId;

		try {
			const electionsResponse: { elections: Election[] } = await this.unitOfWork.Elections.getAll(true, false);
			const ballotPapersResponse: { ballotPapers: BallotPaper[] } = await this.unitOfWork.BallotPapers.getAllByVoter(userId, false);
			const ballotPaperElectionIds: string[] = ballotPapersResponse.ballotPapers
				.filter((bp: BallotPaper) => !bp.voted)
				.map((bp: BallotPaper) => bp.electionId);
			const nonVotedElections: Election[] =
				electionsResponse.elections.filter((e: Election) => ballotPaperElectionIds.includes(e.electionId));

			return ResponseBuilder.ok({ elections: nonVotedElections });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getElectionResults: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const electionId: string = event.pathParameters.electionId;

		try {
			// Check this election has finished and has winner
			const election: Election = await this.unitOfWork.Elections.get(electionId);

			return ResponseBuilder.ok({ election });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public startElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters - Election ID is missing');

		const electionId: string = event.pathParameters.electionId;

		try {
			const election: Election = await this.unitOfWork.Elections.get(electionId);
			election.electionStarted = true;
			const updatedElection: Election = await this.unitOfWork.Elections.update(election);

			return ResponseBuilder.ok({ election: updatedElection });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public finishElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters - Election ID is missing');

		const electionId: string = event.pathParameters.electionId;

		try {
			const election: Election = await this.unitOfWork.Elections.get(electionId);
			election.electionFinished = true;

			const ballots: BallotPaper[] = (await this.unitOfWork.BallotPapers.getAllByElection(electionId)).ballotPapers;
			const candidateCounts: { [candidateId: string]: number } = { };

			election.candidates.map((cd: CandidateDetails) => {
				candidateCounts[cd.candidateId] = ballots.filter((b: BallotPaper) => b.voteCandidateId === cd.candidateId).length;
			}); // Store these values in election item?

			let highest: { candidateId: string; count: number };

			Object.keys(candidateCounts).forEach((c: any) => {
				if (!highest) highest = { candidateId: c, count: candidateCounts[c] };
				else {
					if (candidateCounts[c] > highest.count) highest = { candidateId: c, count: candidateCounts[c] };
				}
			});

			const winner: CandidateDetails = election.candidates.find((c: CandidateDetails) => c.candidateId === highest.candidateId);
			election.winner = winner;

			const updatedElection: Election = await this.unitOfWork.Elections.update(election);

			return ResponseBuilder.ok({ election: updatedElection });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public createElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: CreateElectionRequest = JSON.parse(event.body);

		if (!data.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'User ID is missing');
		if (!data.electionName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election Name is missing');
		if (data.electionName.length < 3) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election Name must be at least 3 characters in length');

		try {
			const creator: User = await this.unitOfWork.Users.getById(data.userId);

			const partialElection: Partial<Election> = {
				electionName: data.electionName,
				candidates: [],
				createdBy: {
					userId: creator.userId,
					firstName: creator.firstName,
					lastName: creator.lastName
				}
			};

			const election: Election = await this.unitOfWork.Elections.create(partialElection);

			return ResponseBuilder.ok({ election });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public updateElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: UpdateElectionRequest = JSON.parse(event.body);

		if (!data.election) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election Details are missing');
		if (!data.election.electionId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election ID is missing');

		try {
			const election: Election = await this.unitOfWork.Elections.update(data.election);

			return ResponseBuilder.ok({ election });
		} catch (err) {
			console.log(err);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public deleteElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters - Election ID is missing');

		const electionId: string = event.pathParameters.electionId;

		try {
			const election: Election = await this.unitOfWork.Elections.delete(electionId);

			return ResponseBuilder.ok({ election });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
