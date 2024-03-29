/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

export default function Loader({ text = "Loading...", timeout = 0 }) {
  useEffect(() => {
    if (!timeout) return;
    const timeoutId = setTimeout(window.location.reload, timeout);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center space-y-2">
      <div className="w-[1.375rem] h-[1.375rem] border-2 border-transparent border-t-black border-b-black rounded-[50%] animate-spin-fast" />
      <div>{text}</div>
    </div>
  );
}
