export class RecordNotFoundException extends Error {
  constructor(entity: string, identifier: string | Record<string, any>) {
    const id =
      typeof identifier === 'string' ? identifier : JSON.stringify(identifier);
    super(`${entity} with identifier ${id} was not found`);
    this.name = 'RecordNotFoundException';
  }
}
