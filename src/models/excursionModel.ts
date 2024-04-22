import {IOrganization} from "./organizationModel";
import {IClient} from "./clientModel";
import {ICheckpoint} from "./checkpointModel";
import {IMedia} from "./mediaModel";
import {IActivity} from "./activitiesModel";
import {IReview} from "./reviewsModel";
import {IFinance} from "./financeModel";
import {ITransport} from "./transportModel";
import {IFood} from "./foodModel";
import {IProjection} from "./projectionModel";

export interface IExcursion {
    title: string;
    destination: IOrganization;
    organization: IOrganization;
    clients: IClient[];
    finance: IFinance;
    checkpoints: ICheckpoint[];
    flyer: IMedia;
    images: IMedia[];
    videos: IMedia[];
    audios: IMedia[];
    activities: IActivity[];
    reviews: IReview[];
    transport: ITransport;
    foods: IFood[];
    projections: IProjection[];
    startDate: Date;
    endDate: Date;
}
