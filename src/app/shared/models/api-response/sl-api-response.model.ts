export interface SLApiResponse {
    departures: Departure[];
    stop_deviations: StopDeviation[];
}

export interface Departure {
    destination: string;
    direction_code: number;
    direction: string;
    state: string;
    display: string;
    scheduled: Date;
    expected: Date;
    journey: Journey;
    stop_area: StopArea;
    stop_point: StopPoint;
    line: Line;
    deviations: any[];
}

export interface Journey {
    id: number;
    state: string;
    prediction_state?: string;
}

export interface Line {
    id: number;
    designation: string;
    transport_mode: string;
    group_of_lines: string;
}

export interface StopArea {
    id: number;
    name: string;
    type: Type;
}

export enum Type {
    Metrostn = "METROSTN",
}

export interface StopPoint {
    id: number;
    name: string;
    designation: string;
}

export interface StopDeviation {
    id: number;
    importance_level: number;
    message: string;
    scope: Scope;
}

export interface Scope {
    stop_areas: StopArea[];
    stop_points: StopPoint[];
    lines: Line[];
}
