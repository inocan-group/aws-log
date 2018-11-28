// tslint:disable:no-invalid-template-strings
import { IServerlessFunction, IDictionary } from "common-types";

const logShipper: IServerlessFunction = {
  handler: "lib/handlers/log-shipper.handler"
};

const functions: IDictionary<IServerlessFunction> = {
  logShipper
};

export default functions;
