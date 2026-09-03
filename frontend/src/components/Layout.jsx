import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="layout-content">{children}</div>
    </div>
  );
}

export default Layout;