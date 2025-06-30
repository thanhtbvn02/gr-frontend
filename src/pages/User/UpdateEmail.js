import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./UpdateEmail.css";
import useUser from "../../hooks/useUser";

function UpdateEmail() {
  const { id } = useParams();
  const [email, setEmail] = useState("");
  const { updateEmail } = useUser();
  const handleUpdateEmail = async () => {
    try {
      await updateEmail({ id, email });
      alert("Email đã được cập nhật thành công");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="update-email-container">
      <div className="update-email-header">
        <h1>
          Mã xác thực (OTP) sẽ được gửi đến email này để xác minh email là của
          bạn
        </h1>
        <div className="update-email-form">
          <div className="update-email-form-item">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email mới"
            />
          </div>
        </div>
        <button onClick={handleUpdateEmail}>Cập nhật</button>
      </div>
    </div>
  );
}

export default UpdateEmail;
