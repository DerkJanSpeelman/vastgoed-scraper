import { NotFoundError, UnprocessableError } from "@/lib/errors";

export class AgencyNotFoundError extends NotFoundError {
  constructor(id: number) {
    super(`Makelaar met id ${id} bestaat niet`);
  }
}

export class AgencyHasListingsError extends UnprocessableError {
  constructor() {
    super("Makelaar kan niet worden verwijderd omdat er nog listings aan gekoppeld zijn");
  }
}
