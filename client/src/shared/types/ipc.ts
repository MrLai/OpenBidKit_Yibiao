import type { ChatCompletionRequest, JsonCompletionRequest } from './ai';
import type { ClientConfig, ConfigSaveResult, ModelListResult } from './config';

export interface YibiaoBridge {
  appName: string;
  platform: string;
  config: {
    load: () => Promise<ClientConfig>;
    save: (config: ClientConfig) => Promise<ConfigSaveResult>;
    listModels: () => Promise<ModelListResult>;
  };
  ai: {
    chat: (request: ChatCompletionRequest) => Promise<string>;
    requestJson: <TResult = unknown>(request: JsonCompletionRequest) => Promise<TResult>;
  };
  file: {
    importDocument: () => Promise<unknown>;
  };
  export: {
    exportWord: (payload: unknown) => Promise<unknown>;
  };
}
