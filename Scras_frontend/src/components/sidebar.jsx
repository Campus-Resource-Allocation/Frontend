// ============================================================
// Sidebar.jsx
// shared sidebar for Teacher and TA portal
// ============================================================

import { get_user } from "../services/api_config";

const Sidebar = ({ active_page, on_navigate, on_logout }) => {

    const user = get_user();

    const get_initials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="sidebar">

            <div className="sidebar_logo">
                <div className="sidebar_logo_icon">S</div>
                <div>
                    <div className="sidebar_logo_text">SCRAS</div>
                </div>
                <span className="sidebar_badge">Faculty</span>
            </div>

            <div className="sidebar_label">Portal</div>

            <nav className="sidebar_nav">
                <button
                    className={`sidebar_item ${active_page === "room_finder" ? "active" : ""}`}
                    onClick={() => on_navigate("room_finder")}
                >
                    <span className="sidebar_item_icon">🔍</span>
                    Room Finder
                </button>

                <button
                    className={`sidebar_item ${active_page === "my_bookings" ? "active" : ""}`}
                    onClick={() => on_navigate("my_bookings")}
                >
                    <span className="sidebar_item_icon">📋</span>
                    My Bookings
                </button>
            </nav>

            <div className="sidebar_user">
                <div className="sidebar_user_avatar">
                    {get_initials(user?.name)}
                </div>
                <div className="sidebar_user_info">
                    <div className="sidebar_user_name">{user?.name || "User"}</div>
                    <div className="sidebar_user_email">{user?.email || ""}</div>
                </div>
                <button
                    className="sidebar_logout_btn"
                    onClick={on_logout}
                    title="Logout"
                >
                    ↪
                </button>
            </div>

        </div>
    );
};

export default Sidebar;