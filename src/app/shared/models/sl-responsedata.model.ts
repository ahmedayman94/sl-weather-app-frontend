import { SLTransportationMethod } from './sl-transportation-method.model';

export interface SLResponseData {
    Buses: SLTransportationMethod[];

    Trains: SLTransportationMethod[];

    Metros: SLTransportationMethod[];

    LatestUpdate: string;
}