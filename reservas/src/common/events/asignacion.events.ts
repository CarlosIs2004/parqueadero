export class AsignacionCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly vehicleId: string,
    public readonly newState: Record<string, unknown>,
  ) {}
}

export class AsignacionRemovedEvent {
  constructor(
    public readonly userId: string,
    public readonly vehicleId: string,
    public readonly oldState: Record<string, unknown>,
  ) {}
}
