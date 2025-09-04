import { BrowserRouter, Route, Routes } from "react-router";
import LoginIndexPage from "./pages/LoginIndexPage";
import AdminBasicInfo from "./components/admin/AdminBasicInfo";
import Dashboard from "./pages/Dashboard";
import MatchList from "./components/admin/MatchList";
import UserList from "./components/admin/UserList";
import CreateMatch from "./components/admin/CreateMatch";
import EditUser from "./components/admin/EditUser";
import Ticketing from "./pages/Ticketing";
import UserMatchList from "./pages/UserMatchList";
import NotFound from "./pages/errors/NotFound";
import Register from "./pages/Register";
import { useState } from "react";
import { EditStatus } from "./types/EditStatus";
import EntranceList from "./components/admin/EntranceList";
import CreateEntrance from "./components/admin/CreateEntrance";
import EditEntrance from "./components/admin/EditEntrance";
import EditMatch from "./components/admin/EditMatch";
import ProtectedRoute from "./components/ProtectedRoute";
import TicketList from "./components/admin/TicketList";
import MatchDashboard from "./components/admin/MatchDashboard";

function App() {
  const [userEditStatus, setUserEditStatus] = useState<EditStatus | null>(null);
  const [matchCreateStatus, setMatchCreateStatus] = useState<EditStatus | null>(
    null
  );
  const [entranceEditStatus, setEntranceEditStatus] =
    useState<EditStatus | null>(null);

  // TODO: zamyslet se nad nutnosti app, nebo rovou jit na ticketing
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LoginIndexPage />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
          <Route path="admin" element={<Dashboard />}>
            <Route index element={<AdminBasicInfo />} />
            <Route path="matches">
              <Route
                index
                element={<MatchList matchCreateStatus={matchCreateStatus} />}
              />
              <Route
                path="create"
                element={<CreateMatch onCreateMatch={setMatchCreateStatus} />}
              />
              <Route
                path=":matchID/edit"
                element={<EditMatch onEditMatch={setMatchCreateStatus} />}
              />
              <Route path=":matchID/stats" element={<MatchDashboard />} />
            </Route>
            <Route path="users">
              <Route index element={<UserList userEdit={userEditStatus} />} />
              <Route
                path=":userID/edit"
                element={<EditUser onUserSave={setUserEditStatus} />}
              />
              {/* <Route path="create" element={<h1>Create User</h1>} /> */}
            </Route>
            <Route path="entrances">
              <Route
                index
                element={<EntranceList entranceStatus={entranceEditStatus} />}
              />
              <Route
                path=":entranceID/edit"
                element={
                  <EditEntrance onEntranceEdit={setEntranceEditStatus} />
                }
              />
              <Route
                path="create"
                element={
                  <CreateEntrance onEntranceCreate={setEntranceEditStatus} />
                }
              />
            </Route>
            <Route path="tickets">
              <Route index element={<TicketList />} />
            </Route>
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ROLE_USER"]} />}>
          <Route path="app">
            <Route index element={<UserMatchList />} />
            <Route path="ticketing/:matchID" element={<Ticketing />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
