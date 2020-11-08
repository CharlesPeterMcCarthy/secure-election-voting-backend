import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	LastEvaluatedKey,
	Election, BallotPaper
} from '../../api-shared-modules/src';
import { ElectionItem } from '../../api-shared-modules/src/models/core/Election';
import {CreateElectionRequest, RegisterForElectionRequest, UpdateElectionRequest} from './election.interfaces';
import {BallotPaperController} from "../../api-ballot-paper/src/ballot-paper.controller";

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
				await this.unitOfWork.Elections.getAll(undefined, lastEvaluatedKey);
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
				await this.unitOfWork.Elections.getAll(false, lastEvaluatedKey);
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
				await this.unitOfWork.Elections.getAll(true, lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Elections');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllElectionsUnregisteredByUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters - User ID is missing');

		const userId: string = event.pathParameters.userId;

		try {
			const electionsResponse: { elections: Election[] } = await this.unitOfWork.Elections.getAll(false);
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
		if (!event.pathParameters || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters - User ID is missing');

		const userId: string = event.pathParameters.userId;

		try {
			const electionsResponse: { elections: Election[] } = await this.unitOfWork.Elections.getAll(false);
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

	public createElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: CreateElectionRequest = JSON.parse(event.body);

		// if (!data.adminId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Admin details are missing');
		if (!data.electionName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election Name is missing');
		if (data.electionName.length < 3) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election Name must be at least 3 characters in length');

		const partialElection: Partial<Election> = {
			electionName: data.electionName,
			candidates: []
		};

		try {
			const election: Election = await this.unitOfWork.Elections.create(partialElection);

			return ResponseBuilder.ok({ election });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public updateElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: UpdateElectionRequest = JSON.parse(event.body);

		// if (!data.adminId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Admin details are missing');
		if (!data.election) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election Details are missing');
		if (!data.election.electionId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election ID is missing');

		const updatedElection: Election = data.election;

		try {
			const election: Election = await this.unitOfWork.Elections.update(updatedElection);

			return ResponseBuilder.ok({ election });
		} catch (err) {
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
