export interface WatcherParams<T> {
  onMessage: (payload: T) => void;
  onError: (error: any) => void;
}

export interface WatcherResponse {
  refresh: () => void;
  stop: () => void;
}
