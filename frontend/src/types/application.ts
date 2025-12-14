export type Language = "en" | "mk";

export interface ApplicationTranslation {
  language: Language;
  name: string;
  description: string;
}

export interface Application {
  id: number;
  ownerId?: number;
  logo: string;
  languages: Language[];
  translations: ApplicationTranslation[];
}
