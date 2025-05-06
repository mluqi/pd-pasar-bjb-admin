import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import IuranTable from "./IuranTable";
import ComponentCard from "../../components/common/ComponentCard";

export default function Blank() {
  return (
    <>
      <PageMeta
        title="Dashboard | Iuran Data"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Iuran Data" />
      <div className="space-y-6">
        <ComponentCard title="List Iuran">
          <IuranTable />
        </ComponentCard>
      </div>
    </>
  );
}
