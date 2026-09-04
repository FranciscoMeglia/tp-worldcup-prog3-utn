import { FinalChatApiResponse, FinalChatTeamsPreviewApiResponse } from './final-chat-api.interface';

export interface FinalChatMessageViewItem {
  text: string;
  icon: string;
}

export interface FinalChatViewModel {
  lang: 'es' | 'en';
  loading: boolean;
  starting: boolean;
  sending: boolean;
  errorMessage: string;
  actionErrorMessage: string;
  showNoFinalState: boolean;
  data: FinalChatApiResponse | null;
  teamsPreview: FinalChatTeamsPreviewApiResponse | null;
  homeFlag: string,
  awayTeamFlag: string
}
