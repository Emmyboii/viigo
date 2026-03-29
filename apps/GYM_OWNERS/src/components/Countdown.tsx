import { useState, useEffect } from "react";

interface CountdownProps {
  initialText: string; // e.g. "00:47 min" or "01:30 min"
}

export default function Countdown({ initialText }: CountdownProps) {
  // Extract hours and minutes from backend string
  const match = initialText.match(/(\d{1,2}):(\d{2})/);
  const initialMinutes = match
    ? parseInt(match[1]) * 60 + parseInt(match[2])
    : parseInt(initialText.match(/\d+/)?.[0] || "0"); // fallback if just minutes

  // We'll track remaining time in **seconds**
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000); // tick every second

    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Format as HH:MM for display
  const formatTime = (totalSeconds: number) => {
    const totalMinutes = Math.ceil(totalSeconds / 60); // round up to next minute
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")} min`;
  };

  return <span>{formatTime(secondsLeft)}</span>;
}