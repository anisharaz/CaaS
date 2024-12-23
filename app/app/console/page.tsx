import { ConsoleOptions, ConsoleContainers } from "./ConsoleHomeComponents";

function ConsolePage() {
  return (
    <>
      <div className="max-w-screen-2xl md:space-y-6 space-y-2 md:m-auto mx-2">
        <div className="text-2xl md:text-4xl font-bold md:mt-4 mt-2">
          Console Home
        </div>
        <div className="sm:flex md:grid grid-cols-2 gap-4">
          <ConsoleOptions />
          <ConsoleContainers />
        </div>
      </div>
    </>
  );
}

export default ConsolePage;
