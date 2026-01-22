export default function Loader({ text = "Loading..." }) {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center space-y-2">
      <div className="w-5.5 h-5.5 border-2 border-transparent border-t-black border-b-black rounded-[50%] animate-spin-fast" />
      <div>{text}</div>
    </div>
  );
}
