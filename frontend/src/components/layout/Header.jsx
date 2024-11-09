import React from "react";
import Search from "./Search";
import { useGetMeQuery } from "../../redux/api/userApi";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useLazyLogoutQuery } from "../../redux/api/authApi";
import AddressDisplay from "../AdditionalFunctions/AddressDisplay";
import { clearCart } from "../../redux/features/cartSlice"; // Import clearCart action

const Header = () => {
  const dispatch = useDispatch(); // Use dispatch hook
  const navigate = useNavigate();
  const { isLoading } = useGetMeQuery();
  const [logout, { data }] = useLazyLogoutQuery();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  // Logout handler to trigger logout API and clear cart
  const logoutHandler = async () => {
    try {
      await logout().unwrap(); // Use unwrap to handle the promise
      dispatch(clearCart()); // Clear the cart on logout
      window.location.reload(); // Full webpage refresh
      navigate("/"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed: ", error); // Handle errors if needed
    }
  };

  return (
    <>
      <nav className="navbar row">
        <div className="col-12 col-md-3 ps-5">
          <div className="navbar-brand">
            <a href="https://www.tactrendsshop.com/">
              <img src="/images/LogoTactical.png" alt="Tactical Trends Logo" />
            </a>
          </div>
        </div>
        <div className="col-12 col-md-6 mt-2 mt-md-0 d-flex align-items-center">
          <AddressDisplay style={{ marginRight: "20px !important" }} /> &nbsp;
          <Search />
        </div>
        <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">
          <a href="/cart" style={{ textDecoration: "none" }}>
            <span id="cart" className="ms-3">Cart</span>
            <span className="ms-1" id="cart_count">{cartItems?.length}</span>
          </a>

          {user ? (
            <div className="ms-4 dropdown">
              <button
                className="btn dropdown-toggle text-white"
                type="button"
                id="dropDownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <figure className="avatar avatar-nav">
                  <img
                    src={user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"}
                    alt="User Avatar"
                    className="rounded-circle"
                  />
                </figure>
                <span>{user?.name}</span>
              </button>
              <div className="dropdown-menu w-100" aria-labelledby="dropDownMenuButton">
                {user?.role === "admin" && (
                  <Link className="dropdown-item" to="/admin/dashboard">
                    Dashboard
                  </Link>
                )}
                <Link className="dropdown-item" to="/me/orders">Orders</Link>
                <Link className="dropdown-item" to="/me/profile">Profile</Link>
                <Link className="dropdown-item text-danger" to="/login" onClick={logoutHandler}>Logout</Link>
              </div>
            </div>
          ) : (
            !isLoading && (
              <Link to="/login" className="btn ms-4" id="login_btn">Login</Link>
            )
          )}
        </div>
      </nav>

      {/* Quick Links Section */}
      <div className="quick-links text-center">
      <Link to="/">Home</Link>
        <Link to="/?keyword=Samsung">Samsung</Link>
        <Link to="/?keyword=Iphone">Iphone</Link>
        <Link to="/?keyword=earbuds">Earbuds</Link>
        <Link to="/?keyword=Chargers">Chargers</Link>
        <Link to="/?keyword=Mounts">Mounts</Link>
        <Link to="/?keyword=Clothing">Clothing</Link>
      </div>
    </>
  );
};

export default Header;
