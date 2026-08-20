import { useState, useEffect } from "react";

export function useHourlyFont() {
  const getFontForCurrentHour = () => {
    const hour = new Date().getHours();
    // Even hour: Poppins, Odd hour: Zain
    return hour % 2 === 0
      ? { name: "Poppins", family: "'Poppins', sans-serif", isEven: true }
      : { name: "Zain", family: "'Zain', sans-serif", isEven: false };
  };

  const [currentFont, setCurrentFont] = useState(getFontForCurrentHour);

  useEffect(() => {
    const applyFont = () => {
      const font = getFontForCurrentHour();
      setCurrentFont(font);
      document.documentElement.style.setProperty("--font-sans", font.family);
    };

    // Apply immediately
    applyFont();

    // Check every 30 seconds for hourly boundary change
    const interval = setInterval(applyFont, 30000);
    return () => clearInterval(interval);
  }, []);

  return currentFont;
}
