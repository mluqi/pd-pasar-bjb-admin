import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import LogActivityTable from "./LogActivityTable";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="Dashboard | Log Activity"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Log Activity" />
      <div className="space-y-6">
        <ComponentCard title="Log Activity Table">
          <LogActivityTable />
        </ComponentCard>
      </div>
    </>
  );
}
