import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Information from "./Information";
import Address from "./Address";
import UpdateEmail from "./UpdateEmail";
import UpdatePass from "./UpdatePass";
import "./Account.css";
import Header from "../../components/Header/Header";
const Account = () => {
  const [activeTab, setActiveTab] = useState("info");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }

    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("tab");
    if (
      tabParam === "address" ||
      tabParam === "info" ||
      tabParam === "updateEmail" ||
      tabParam === "updatePass"
    ) {
      setActiveTab(tabParam);
    }
    
  }, [location]);
  return (
    <div>
      <Header />
      <div className="account-wrapper">
        <div className="account-tabs">
          <button
            className={activeTab === "info" ? "active" : ""}
            onClick={() => setActiveTab("info")}
          >
            Thông tin
          </button>
          <button
            className={activeTab === "address" ? "active" : ""}
            onClick={() => setActiveTab("address")}
          >
            Địa chỉ
          </button>
        </div>

        <div className="account-content">
          {activeTab === "info" ? (
            <Information />
          ) : activeTab === "address" ? (
            <Address />
          ) : activeTab === "updateEmail" ? (
            <UpdateEmail />
          ) : (
            <UpdatePass />
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
