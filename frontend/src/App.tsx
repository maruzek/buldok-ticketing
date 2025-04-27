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
import { UserEditStatus } from "./types/UserEditStatus";
import EntranceList from "./components/admin/EntranceList";
import CreateEntrance from "./components/admin/CreateEntrance";
import { MatchEditStatus } from "./types/MatchEditStatus";

function App() {
  const [userEditStatus, setUserEditStatus] = useState<UserEditStatus | null>(
    null
  );
  const [matchEditStatus, setMatchEditStatus] =
    useState<MatchEditStatus | null>(null);
  const [matchCreateStatus, setMatchCreateStatus] =
    useState<MatchEditStatus | null>(null);

  // TODO: zamyslet se nad nutnosti app, nebo rovou jit na ticketing
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LoginIndexPage />} />
        <Route path="about" element={<h1>About</h1>} />
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
            <Route index element={<EntranceList />} />
            <Route path="create" element={<CreateEntrance />} />
            {/* <Route path="create" element={<h1>Create User</h1>} /> */}
          </Route>
        </Route>
        <Route path="app">
          <Route index element={<UserMatchList />} />
          <Route path="ticketing/:matchID" element={<Ticketing />} />
        </Route>
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
