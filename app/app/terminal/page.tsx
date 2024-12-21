import dynamic from "next/dynamic";

const TerminalComponent = dynamic(() => import("./terminal"), {
  ssr: false,
});

function Terminal() {
  return (
    <div className="m-5">
      <TerminalComponent />
    </div>
  );
}

export default Terminal;
