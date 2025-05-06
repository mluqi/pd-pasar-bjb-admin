import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import LogAksesTable from "./LogAksesTable";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="Dashboard | Log Akses"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Log Akses" />
      <div className="space-y-6">
        <ComponentCard title="Log Akses Table">
          <LogAksesTable />
        </ComponentCard>
      </div>
    </>
  );
}
