interface BoardInfo {
    boardTime: string;
    latestUpdate: string;
}

export interface TransportationTimes {
    bus: BoardInfo,
    metro: BoardInfo
}