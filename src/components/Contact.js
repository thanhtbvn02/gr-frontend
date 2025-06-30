import React, { useState } from "react";
import "./Contact.css";

function Contact() {
  return (
    <div className="contact">
      <div className="contact-container">
        <div className="contact-section-header text-center">
          <h2>Liên hệ với chúng tôi</h2>
          <p>Liên hệ bằng các cách sau</p>
        </div>
        <div className="row align-items-center contact-information">
          <div className="col-md-6 col-lg-3">
            <div className="contact-info">
              <div className="contact-info-icon">
                <img src="https://cdn-icons-png.flaticon.com/128/10903/10903041.png"></img>
              </div>
              <div className="contact-info-text">
                <h3>Địa chỉ</h3>
                <p>Bách Khoa, Hà Nội, Việt Nam</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="contact-info">
              <div className="contact-info-icon">
                <img src="https://cdn-icons-png.flaticon.com/128/2354/2354127.png"></img>
              </div>
              <div className="contact-info-text">
                <h3>Gọi cho chúng tôi</h3>
                <p>+012 345 6789</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="contact-info">
              <div className="contact-info-icon">
                <img src="https://cdn-icons-png.flaticon.com/128/542/542689.png"></img>
              </div>
              <div className="contact-info-text">
                <h3>Email cho chúng tôi</h3>
                <p>hustpharma@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="contact-info">
              <div className="contact-info-icon">
                <img src="https://cdn-icons-png.flaticon.com/128/2958/2958791.png"></img>
              </div>
              <div className="contact-info-text">
                <h3>Theo dõi chúng tôi</h3>
                <div className="contact-info-social">
                  <a href="https://twitter.com/?lang=en">
                    <img src="https://cdn-icons-png.flaticon.com/128/3670/3670151.png"></img>
                  </a>
                  <a href="https://www.facebook.com/">
                    <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png"></img>
                  </a>
                  <a href="https://www.youtube.com/">
                    <img src="https://cdn-icons-png.flaticon.com/128/3670/3670147.png"></img>
                  </a>
                  <a href="https://www.instagram.com/?hl=en">
                    <img src="https://cdn-icons-png.flaticon.com/128/3955/3955024.png"></img>
                  </a>
                  <a href="https://vn.linkedin.com/">
                    <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png"></img>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="contact-benefit-bar">
          <div className="contact-benefit-container">
            <div className="contact-benefit-item">
              <img
                src="/fast-delivery.png"
                className="contact-benefit-icon"
                alt="Giao hàng siêu tốc"
              />
              <div className="contact-benefit-info">
                <span className="contact-benefit-title">
                  Giao hàng siêu tốc
                </span>
                <p className="contact-benefit-desc">
                  Giao tận nhà hoặc nhận tại nhà thuốc
                </p>
              </div>
            </div>
            <div className="contact-benefit-item">
              <img
                src="/home-loan-approved.png"
                className="contact-benefit-icon"
                alt="Đủ thuốc chuẩn"
              />
              <div className="contact-benefit-info">
                <span className="contact-benefit-title">Đủ thuốc chuẩn</span>
                <p className="contact-benefit-desc">
                  Thuốc chất lượng, phục vụ tận tình
                </p>
              </div>
            </div>
            <div className="contact-benefit-item">
              <img
                src="/free-shipping.png"
                className="contact-benefit-icon"
                alt="Miễn phí vận chuyển"
              />
              <div className="contact-benefit-info">
                <span className="contact-benefit-title">
                  Miễn phí vận chuyển
                </span>
                <p className="contact-benefit-desc">
                  Cho mọi đơn hàng toàn quốc
                </p>
              </div>
            </div>
            <div className="contact-benefit-item">
              <img
                src="/house.png"
                className="contact-benefit-icon"
                alt="Nhà thuốc gần bạn"
              />
              <div className="contact-benefit-info">
                <span className="contact-benefit-title">Nhà thuốc gần bạn</span>
                <p className="contact-benefit-desc">
                  Dễ dàng tìm nhà thuốc gần bạn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
