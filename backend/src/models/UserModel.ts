import { Share } from "./ShareModel";

export interface User {
  id: string;
  email: string;
  password: string;
  shares: Share[] | null;
}


