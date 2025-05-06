import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import LapakTable from "./LapakTable";
import ComponentCard from "../../components/common/ComponentCard";

export default function Blank() {
  return (
        <>
        <PageMeta
          title="Dashboard | Lapak"
          description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
        />
        <PageBreadcrumb pageTitle="Lapak Management" />
        <div className="space-y-6">
          <ComponentCard title="List Lapak">
            <LapakTable />
          </ComponentCard>
        </div>
      </>
  );
}
