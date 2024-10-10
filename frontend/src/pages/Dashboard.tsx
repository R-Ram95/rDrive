import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/library/BreadCrumbs";
import FileViewer from "@/components/FileViewer";
import { useAuth } from "@/hooks/useAuth";
import { usePath } from "@/hooks/usePath";
import { ROOT_PATH } from "@/lib/constants";

const Dashboard = () => {
  const { logout } = useAuth();
  const { currentPath, pathFragments, addPath, updateCurrentPath } = usePath();

  return (
    <div className="h-full">
      <header className="flex justify-between  px-10 py-4 bg-cover bg-[url('/image.jpeg')]">
        <h1 className="text-2xl font-semibold text-white">r/Drive</h1>
        <div className=" border px-3 py-1 rounded-xl font-medium backdrop-blur-xl shadow-2xl border-white/50">
          <button className="text-white" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </header>
      <div className="flex flex-col px-10 pb-8 h-[calc(100vh-4rem)]">
        <Breadcrumb className="mt-5">
          <BreadcrumbList className="text-lg text-white">
            {pathFragments.map((fragment) => (
              <div className="flex items-center" key={fragment}>
                <BreadcrumbItem
                  className="hover:cursor-pointer hover:bg-slate-50/10 rounded-full py-1 px-2 "
                  onClick={() => updateCurrentPath(fragment)}
                >
                  {fragment === ROOT_PATH ? "Home" : fragment}
                </BreadcrumbItem>
                {pathFragments.length > 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <FileViewer currentPath={currentPath} addPath={addPath} />
      </div>
    </div>
  );
};

export default Dashboard;
