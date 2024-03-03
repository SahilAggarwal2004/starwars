/* eslint-disable react-hooks/exhaustive-deps */
import { useLayoutEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import { useUtilityContext } from "../contexts/UtilityContext";
import { verifyUrl } from "../modules/functions";

export default function Scanner({ router }) {
  const { setModal } = useUtilityContext();
  const [message, setMessage] = useState("");
  const video = useRef();

  useLayoutEffect(() => {
    const qrScanner = new QrScanner(
      video.current,
      ({ data }) => {
        const { verified, pathname } = verifyUrl(data);
        if (!verified) return setMessage("Please scan a valid QR Code");
        setModal({ active: false });
        toast.success("Successfuly scanned the QR Code");
        router.push(pathname);
      },
      { maxScansPerSecond: 5, calculateScanRegion: ({ width, height }) => ({ x: 0, y: 0, width, height }) }
    );
    qrScanner
      .start()
      .then(() => {
        setMessage("Scan QR Code using camera");
      })
      .catch(() => {
        setModal({ active: false });
        toast.error("Camera not accessible");
      });
    return () => qrScanner.stop();
  }, []);

  return (
    <div className={`text-center flex flex-col items-center justify-center px-3 space-y-3 ${!message && "hidden"}`}>
      <span className="text-xs xs:text-sm md:text-base">{message}</span>
      <video ref={video} className="w-[80vw] max-w-96 max-h-[50vh]" />
    </div>
  );
}
