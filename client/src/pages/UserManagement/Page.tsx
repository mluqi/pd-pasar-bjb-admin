import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserTable from "./UserTable";
import ComponentCard from "../../components/common/ComponentCard";

export default function Blank() {
  return (
    <>
      <PageMeta
        title="Dashboard | User Management"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="User Management" />
      <div className="space-y-6">
        <ComponentCard title="List Users">
          <UserTable />
        </ComponentCard>
      </div>
    </>
  );
}
