export interface IAppSettings {
  settings: any;
  isLoggingOut: boolean;
}
export interface IAppSettingsContext extends IAppSettings {
  logout(): void;
  saveSettings(settings: any): void;
  clearSettings(): void;
}
