import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	Election, BallotPaper
} from '../../api-shared-modules/src';
import { ElectionItem } from '../../api-shared-modules/src/models/core/Election';
import { CreateBallotPaperRequest } from './ballot-paper.interfaces';

export class BallotPaperController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getBallotPaperById: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.ballotPaperId || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const ballotPaperId: string = event.pathParameters.ballotPaperId;
		const userId: string = event.pathParameters.userId;

		try {
			const ballotPaper: BallotPaper = await this.unitOfWork.BallotPapers.get(ballotPaperId, userId);

			return ResponseBuilder.ok({ ballotPaper });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Ballot Paper not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllBallotPapersByElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters - Election ID is missing');

		const electionId: string = event.pathParameters.electionId;

		// let lastEvaluatedKey: LastEvaluatedKey;
		// if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { ballotPapers: BallotPaper[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.BallotPapers.getAllByElection(electionId);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Ballot Papers');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllBallotPapersByElectionVoter: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const electionId: string = event.pathParameters.electionId;
		const userId: string = event.pathParameters.userId;

		// let lastEvaluatedKey: LastEvaluatedKey;
		// if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { ballotPapers: BallotPaper[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.BallotPapers.getAllByElectionVoter(userId, electionId);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Ballot Papers');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllBallotPapersByCandidate: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId || !event.pathParameters.candidateId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const electionId: string = event.pathParameters.electionId;
		const candidateId: string = event.pathParameters.candidateId;

		// let lastEvaluatedKey: LastEvaluatedKey;
		// if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { ballotPapers: BallotPaper[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.BallotPapers.getAllByElectionCandidate(electionId, candidateId);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Ballot Papers');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public createBallotPaper: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: CreateBallotPaperRequest = JSON.parse(event.body);

		if (!data.electionId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election ID is missing');
		if (!data.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'User ID is missing');

		try {
			const election: Election = await this.unitOfWork.Elections.get(data.electionId);

			const partialBallotPaper: Partial<BallotPaper> = {
				...data,
				candidates: election.candidates
			};

			const ballotPaper: BallotPaper = await this.unitOfWork.BallotPapers.create(partialBallotPaper);

			return ResponseBuilder.ok({ ballotPaper });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Election not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
