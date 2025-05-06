import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PasarTable from "./PasarTable";
import ComponentCard from "../../components/common/ComponentCard";

export default function Blank() {
  return (
    <>
      <PageMeta
        title="Dashboard | Pasar Management"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Pasar Management" />
      <div className="space-y-6">
        <ComponentCard title="List Pasar">
          <PasarTable />
        </ComponentCard>
      </div>
    </>
  );
}
