import { CpuUsesChart } from "./charts/CpuUses";
import { MemoryUsesChart } from "./charts/MemoryUses";
import ContainerDetailTabs from "./tabs";
function ContainerDetail() {
  return (
    <div
      style={{
        height: "calc(100vh - 65px)",
        overflow: "auto",
      }}
      className="p-4 space-y-6"
    >
      <div className="rounded-lg md:flex md:flex-row gap-4 flex flex-col">
        <MemoryUsesChart />
        <CpuUsesChart />
      </div>
      <div>
        <ContainerDetailTabs container_name={"some-thing"} />
      </div>
    </div>
  );
}

export default ContainerDetail;
