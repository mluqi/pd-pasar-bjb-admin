import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TypeLapakTable from "./TypeLapakTable";
import ComponentCard from "../../components/common/ComponentCard";

export default function TypeLapakPage() {
  return (
    <>
      <PageMeta
        title="Dashboard | Tipe Lapak"
        description="Manage Type Lapak in the system"
      />
      <PageBreadcrumb pageTitle="Tipe Lapak" />
      <div className="space-y-6">
        <ComponentCard title="Tipe Lapak Table">
          <TypeLapakTable />
        </ComponentCard>
      </div>
    </>
  );
}