export type Match = {
  id: number;
  rival: string;
  description: string;
  playedAt: {
    date: string;
    timezone_type: string;
    timezone: string;
  };
  status: string;
};
