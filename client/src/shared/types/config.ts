export interface AiConfig {
  api_key: string;
  base_url?: string;
  model_name: string;
}

export interface ConfigSaveResult {
  success: boolean;
  message: string;
}

export interface ModelListResult {
  success: boolean;
  message: string;
  models: string[];
}

export type ImageModelProvider = 'volcengine' | 'google-ai-studio';

export interface ImageModelConfig {
  provider: ImageModelProvider;
  api_key: string;
  model_name: string;
}

export type FileParserProvider = 'local' | 'mineru-accurate-api' | 'mineru-agent-api';

export interface FileParserConfig {
  provider: FileParserProvider;
  mineru_token?: string;
}

export interface ClientConfig extends AiConfig {
  image_model: ImageModelConfig;
  file_parser: FileParserConfig;
}
