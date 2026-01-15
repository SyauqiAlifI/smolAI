/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string;
  readonly VITE_AI_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
