import { Response } from "express";

export const response = (
  res: Response,
  status: any,
  message: any,
  data?: any,
  serverData?: any
) : boolean => {
  if (serverData) console.log(message, serverData);
  res.status(status).send({ message, data });
  return true;
};

export const resp =
  (res: Response) =>
  (status: any, message: any, data?: any, serverData?: any) =>
    response(res, status, message, data, serverData);

const getData = (local:any, data:any) =>
  local === undefined
    ? data
    : data === undefined
    ? local
    : Array.isArray(local)
    ? Array.isArray(data)
      ? [...local, data]
      : { ...data, __data: local }
    : { ...local, ...data };

export const respondData =
  (status: any, message: String, data?: Record<string, any>, serverData?: any) =>
  (_ : any, res:Response) =>
    response(
      res,
      status,
      message || res.locals?.message,
      getData(res?.locals?.data, data),
      serverData
    );
