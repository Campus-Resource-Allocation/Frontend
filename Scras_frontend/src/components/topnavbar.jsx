// ============================================================
// TopNavbar.jsx
// top bar with breadcrumb, live badge, user chip
// ============================================================

import { get_user } from "../services/api_config";

const TopNavbar = ({ active_page }) => {

    const user = get_user();

    const get_initials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const get_page_label = (page) => {
        if (page === "room_finder") return "Room Finder";
        if (page === "my_bookings") return "My Bookings";
        return "Dashboard";
    };

    const role_label = user?.role === "TA" ? "TA" : "Teacher";

    return (
        <div className="top_navbar">

            <div className="top_navbar_breadcrumb">
                <span>{role_label}</span>
                <span>›</span>
                <span className="top_navbar_breadcrumb_current">
                    {get_page_label(active_page)}
                </span>
            </div>

            <div className="top_navbar_right">
                <div className="live_badge">
                    <div className="live_dot"></div>
                    LIVE
                </div>
                <button className="notification_btn">🔔</button>
                <div className="user_chip">
                    <div className="user_chip_avatar">
                        {get_initials(user?.name)}
                    </div>
                    {role_label}
                </div>
            </div>

        </div>
    );
};

export default TopNavbar;