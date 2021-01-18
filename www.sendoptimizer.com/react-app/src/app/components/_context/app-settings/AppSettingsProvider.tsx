import React, { useCallback, useEffect, useState } from "react";
import AppSettingsContext from "./AppSettingsContext";

// ------- INTERFACE ---------- //
const AppSettingsProvider: React.FC = (props) => {
  // --------- INIT SETTINGS ---------- //
  // Return either null or the browser-stored settings (if they exist).
  const checkSettings = useCallback(() => {
    const cached_settings = localStorage.getItem("app_settings");
    if (cached_settings) return JSON.parse(cached_settings);
    else return null;
  }, []);

  // ------ STATE ----- //
  const [settings, setSettings] = useState(checkSettings());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const clearSettings = useCallback(() => {
    localStorage.clear();
    // localStorage.removeItem("ac_account_name");
    // localStorage.removeItem("ac_api_key");
    setSettings(null);
  }, [setSettings]);

  // ------- LOGOUT ------- //
  const logout = useCallback(() => {
    setIsLoggingOut(true);
    clearSettings();
    window.location.href = "/logout";
  }, [setIsLoggingOut, clearSettings]);

  // --------- UPDATE SETTINGS ON FOCUS ---------- //
  useEffect(() => {
    const checkUpdateSettings = () => {
      const newSettings = checkSettings();
      if (newSettings === null && settings !== null) logout();
      else if (JSON.stringify(newSettings) !== JSON.stringify(settings))
        // setSettings(checkSettings());
        setSettings(newSettings);
    };
    window.addEventListener("focus", checkUpdateSettings);
    return () => {
      window.removeEventListener("focus", checkUpdateSettings);
    };
  }, [checkSettings, settings, setSettings, logout]);

  // --------- SAVE/CLEAR SETTINGS ---------- //
  const saveSettings = (settings: any) => {
    localStorage.setItem("app_settings", JSON.stringify(settings));
    setSettings(settings);
  };

  // ------- RENDER ---------- //
  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        isLoggingOut,
        logout,
        saveSettings,
        clearSettings,
      }}
    >
      {props.children}
    </AppSettingsContext.Provider>
  );
};

export default AppSettingsProvider;
