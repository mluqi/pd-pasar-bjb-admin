import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PedagangTable from "./PedagangTable";
import ComponentCard from "../../components/common/ComponentCard";

export default function Blank() {
  return (
    <>
      <PageMeta
        title="Dashboard | Pedagang Management"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Pedagang Management" />
      <div className="space-y-6">
        <ComponentCard title="List Pedagang">
          <PedagangTable />
        </ComponentCard>
      </div>
    </>
  );
}
