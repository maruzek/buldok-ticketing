export type ApiError = Error & {
  status: number;
  body?: {
    title?: string;
    detail?: string;
  };
};
