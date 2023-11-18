export {};

declare global {
  export namespace NodeJS {
    export interface ProcessEnv {
      [key: string]: string | undefined;
      KINDE_CLIENT_ID: string;
      KINDE_CLIENT_SECRET: string;
      KINDE_ISSUER_URL: string;
      KINDE_SITE_URL: string;
      KINDE_POST_LOGOUT_REDIRECT_URL: string;
      KINDE_POST_LOGIN_REDIRECT_URL: string;
      NEXT_PUBLIC_URL: string;
      DATABASE_URL: string;
      UPLOADTHING_SECRET: string;
      UPLOADTHING_APP_ID: string;
      PINECONE_API_KEY: string;
      OPENAI_KEY: string;
    }
  }
}
