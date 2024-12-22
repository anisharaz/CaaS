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
      <div className="rounded-lg flex gap-4">
        <MemoryUsesChart />
        <CpuUsesChart />
      </div>
      <div>
        <ContainerDetailTabs />
      </div>
    </div>
  );
}

export default ContainerDetail;
