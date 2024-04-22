import {IClient} from "./clientModel";
import {IComment} from "./commentModel";

export interface IReview {
    client: IClient;
    comment: IComment;
    stars: number;
}
