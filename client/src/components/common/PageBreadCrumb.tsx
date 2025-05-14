import { Link } from "react-router-dom";

interface Crumb {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  pageTitle: string;
  crumbs?: Crumb[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, crumbs }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs && crumbs.length > 0 ? (
            crumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-1.5">
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-800 dark:text-white/90">
                    {crumb.label}
                  </span>
                )}
                {index < crumbs.length - 1 && ( // Tampilkan separator jika bukan crumb terakhir
                  <svg
                    className="stroke-current text-gray-500 dark:text-gray-400"
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            ))
          ) : (
            // Fallback jika crumbs tidak disediakan, bisa disesuaikan
            <>
              <li>
                <Link
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  to="/"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <svg
                  className="stroke-current text-gray-500 dark:text-gray-400"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-gray-800 dark:text-white/90">
                  {pageTitle}
                </span>
              </li>
            </>
          )}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;

