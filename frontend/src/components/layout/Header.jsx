import React, { useContext } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Search from "./Search";
import { useGetMeQuery } from "../../redux/api/userApi";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useLazyLogoutQuery } from "../../redux/api/authApi";
import AddressDisplay from "../AdditionalFunctions/AddressDisplay";
import { clearCart } from "../../redux/features/cartSlice";
import { PRODUCT_CATEGORIES } from "../../constants/constants";
import { SeasonalContext } from "../seasonal/SeasonalContext";
import toast from "react-hot-toast";
import "./Header.css";

function seasonLabel(season) {
  // A madras theme can also be used for other observed cultural holidays.
  if (season.holidayId === "emancipation") return "Emancipation";
  if (season.holidayId === "community") return "Community Day";
  return ({madras: "Independence", carnival: "Carnival", christmas: "Christmas", newyear: "New Year", easter: "Easter"})[season.theme] || season.holidayName || season.themeName || "In season";
}
const Header = () => {
  const dispatch = useDispatch();
  const { isLoading } = useGetMeQuery();
  const [logout, { isFetching: loggingOut }] = useLazyLogoutQuery();
  const { user } = useSelector(state => state.auth);
  const { cartItems = [] } = useSelector(state => state.cart);
  const season = useContext(SeasonalContext);
  const label = season ? seasonLabel(season) : "";
  const cartCount = cartItems.reduce((sum, item) => sum + Math.max(0, Number(item.quantity) || 0), 0);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Account";
  const logoutHandler = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCart());
      window.location.assign("/");
    } catch { toast.error("Could not sign out. Please try again."); }
  };

  return <>
    <header className="tt-main-header" aria-label="Store header">
      <div className="tt-header-inner">
        <Link className="tt-header-brand" to="/?skipSplash=true" aria-label="Tactical Trends Market Place home" data-season={season?.theme || ""}>
          <img src="/images/Tactical-Trends-Marketplace-Branding-Logol.png" alt="" width="64" height="68"/>
          <span className="tt-header-wordmark"><strong>Tactical Trends</strong><span className="tt-header-brand-line"><span>Market Place</span>{season && <span className="tt-header-season" title={season.holidayName || season.themeName} aria-label={`Current season: ${label}`}>{label}</span>}</span></span>
          {season?.decorations && <span className="tt-header-brand-trim" aria-hidden="true"/>}
        </Link>
        <div className="tt-header-search"><Search/></div>
        <div className="tt-header-actions">
          <AddressDisplay/>
          <Link className="tt-header-cart" to="/cart" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}><span className="tt-header-cart-symbol"><i className="bi bi-cart3" aria-hidden="true"/><span className="tt-header-cart-count" aria-hidden="true">{cartCount > 99 ? "99+" : cartCount}</span></span><span className="tt-header-cart-text">Cart</span></Link>
          {user ? <Dropdown className="tt-header-account" align="end">
            <Dropdown.Toggle id="dropDownMenuButton" className="tt-header-account-toggle" variant="link" aria-label={`Account menu for ${user.name || "customer"}`} title={user.name}>
              <i className="bi bi-person-fill" aria-hidden="true"/><span className="tt-header-account-name">{firstName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="tt-header-account-menu" aria-label="Account navigation">
              <div className="tt-header-menu-greeting"><small>Welcome back</small><strong>{user.name}</strong></div>
              {user.role === "admin" && <Dropdown.Item as={Link} to="/admin/dashboard"><i className="bi bi-speedometer2" aria-hidden="true"/> Dashboard</Dropdown.Item>}
              <Dropdown.Item as={Link} to="/me/activity"><i className="bi bi-activity" aria-hidden="true"/> Hub activity</Dropdown.Item>
              <Dropdown.Item as={Link} to="/me/orders"><i className="bi bi-bag-check" aria-hidden="true"/> Orders</Dropdown.Item>
              <Dropdown.Item as={Link} to="/me/profile"><i className="bi bi-person" aria-hidden="true"/> Profile</Dropdown.Item>
              <Dropdown.Divider/>
              <Dropdown.Item as="button" type="button" className="text-danger" disabled={loggingOut} onClick={logoutHandler}><i className="bi bi-box-arrow-right" aria-hidden="true"/> {loggingOut ? "Signing out…" : "Logout"}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> : isLoading ? <span className="tt-header-account-loading" role="status"><span className="spinner-border spinner-border-sm"/><span className="visually-hidden">Loading account</span></span> : <Link to="/login" className="tt-header-signin"><i className="bi bi-person-fill" aria-hidden="true"/><span>Sign in</span></Link>}
        </div>
      </div>
    </header>
    <div className="quick-links text-center">
      <Link to="/?skipSplash=true">Home</Link>
      <Link to="/property-hub">Property Hub</Link>
      <Link to="/food-hub">Food Hub</Link><Link to="/convenience-hub">Convenience Hub</Link><Link to="/hardware-hub">Hardware Hub</Link><Link to="/ride-hub">Ride Hub</Link><Link to="/delivery-hub">Delivery Hub</Link>
      {Object.keys(PRODUCT_CATEGORIES).filter(category => category !== "Property or Real Estate").map(category => <Link key={category} to={`/?category=${encodeURIComponent(category)}&skipSplash=true`}>{category}</Link>)}
    </div>
  </>;
};
export default Header;
