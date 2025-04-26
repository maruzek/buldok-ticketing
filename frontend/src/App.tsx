import { BrowserRouter, Route, Routes } from "react-router";
import LoginIndexPage from "./pages/LoginIndexPage";
import AdminBasicInfo from "./components/admin/AdminBasicInfo";
import Dashboard from "./pages/Dashboard";
import MatchList from "./components/admin/MatchList";
import UserList from "./components/admin/UserList";
import CreateMatch from "./components/admin/CreateMatch";
import EditUser from "./components/admin/EditUser";
import Ticketing from "./pages/Ticketing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LoginIndexPage />} />
        <Route path="about" element={<h1>About</h1>} />
        <Route path="admin" element={<Dashboard />}>
          <Route index element={<AdminBasicInfo />} />
          <Route path="matches">
            <Route index element={<MatchList />} />
            <Route path="create" element={<CreateMatch />} />
          </Route>
          <Route path="users">
            <Route index element={<UserList />} />
            <Route path=":userID/edit" element={<EditUser />} />
            {/* <Route path="create" element={<h1>Create User</h1>} /> */}
          </Route>
        </Route>
        <Route path="app" element={<Ticketing />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
