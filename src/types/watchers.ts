export interface WatcherParams<T> {
  onMessage: (payload: T) => void;
  onError: (error: any) => void;
}
