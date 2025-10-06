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
import Register from "./pages/Register";
import EntranceList from "./components/admin/EntranceList";
import CreateEntrance from "./components/admin/CreateEntrance";
import EditEntrance from "./components/admin/EditEntrance";
import EditMatch from "./components/admin/EditMatch";
import ProtectedRoute from "./components/ProtectedRoute";
import TicketList from "./components/admin/TicketList";
import MatchDashboard from "./components/admin/MatchDashboard";
import CreateSeason from "./components/admin/CreateSeason";
import SeasonList from "./components/admin/SeasonList";
import EditSeason from "./components/admin/EditSeason";
import SeasonDashboard from "./components/admin/SeasonDashboard";
import ErrorPage from "./pages/errors/ErrorPage";
import { SearchX, ShieldBan } from "lucide-react";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LoginIndexPage />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
          <Route path="admin" element={<Dashboard />}>
            <Route index element={<AdminBasicInfo />} />
            <Route path="matches">
              <Route index element={<MatchList />} />
              <Route path="create" element={<CreateMatch />} />
              <Route path=":matchID/edit" element={<EditMatch />} />
              <Route path=":matchID/stats" element={<MatchDashboard />} />
            </Route>
            <Route path="users">
              <Route index element={<UserList />} />
              <Route path=":userID/edit" element={<EditUser />} />
              {/* <Route path="create" element={<h1>Create User</h1>} /> */}
            </Route>
            <Route path="entrances">
              <Route index element={<EntranceList />} />
              <Route path=":entranceID/edit" element={<EditEntrance />} />
              <Route path="create" element={<CreateEntrance />} />
            </Route>
            <Route path="tickets">
              <Route index element={<TicketList />} />
            </Route>
            <Route path="seasons">
              <Route index element={<SeasonList />} />
              <Route path=":seasonID/edit" element={<EditSeason />} />
              <Route path="create" element={<CreateSeason />} />
              <Route path=":seasonID/stats" element={<SeasonDashboard />} />
            </Route>
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ROLE_USER"]} />}>
          <Route path="app">
            <Route index element={<UserMatchList />} />
            <Route path="ticketing/:matchID" element={<Ticketing />} />
          </Route>
        </Route>
        <Route
          path="unauthorized"
          element={
            <ErrorPage
              title="Neoprávněný přístup"
              description="Nemáte oprávnění k přístupu na tuto stránku."
              icon={<ShieldBan />}
            />
          }
        />
        <Route
          path="*"
          element={
            <ErrorPage
              title="Stránka nenalezena"
              description="Omlouváme se, ale stránka, kterou hledáte, neexistuje."
              icon={<SearchX />}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
