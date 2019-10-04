export interface WatcherParams<T> {
  onMessage: (payload: T) => void;
  onError: (error: any) => void;
}

export type WatcherRefreshFunction = () => void;
export type WatcherStopFunction = () => void;

export interface WatcherResponse {
  refresh: WatcherRefreshFunction;
  stop: WatcherStopFunction;
}
