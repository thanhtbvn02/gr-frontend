import React, { useState } from "react";
import "./Footer.css";

function Footer() {
    return(
       <div className="footer-panel">
        <div className="footer-1">
            <div className="infor-footer">
                <div class="infor">
                    <p>GIỚI THIỆU</p>
                    <a>Giới thiệu</a>
                    <a>Hệ thống cửa hàng</a>
                    <a>Giấy phép kinh doanh</a>
                    <a>Quy chế hoạt động</a>
                    <a>Chính sách đổi trả</a>
                    <a>Chính sách giao hàng</a>
                    <a>Chính sách bảo mật</a>
                    <a>Chính sách thanh toán</a>
                    <a>Câu hỏi thường gặp</a>
                </div>
                <div class="infor">
                    <p>DANH MỤC</p>
                    <a>Thực phẩm chức năng</a>
                    <a>Dược mỹ phẩm</a>
                    <a>Chăm sóc cá nhân</a>
                    <a>Trang thiết bị y tế</a>
                    <a>Khuyến mãi HOT</a>
                </div>
                <div class="infor">
                    <p>TÌM HIỂU THÊM</p>
                    <a>Tra cứu thuốc</a>
                    <a>Tra cứu dược chất</a>
                    <a>Tra cứu dược liệu</a>
                    <a>Bệnh thường gặp</a>
                    <a>Bệnh viện</a>
                    <a>Hoạt động xã hội</a>
                    <a>Tin tức tuyển dụng</a>
                </div>
                <div class="infor">
                    <p>TỔNG ĐÀI</p>
                    <a>Tư vấn mua hàng</a>
                    <a>Trung tâm Vắc xin</a>
                    <a>Góp ý, khiếu nại</a>
                    <img src="https://onthisinhvien.com/_next/image?url=%2Fimages%2Ficon%2Fotsv%2Fshoppe.png&w=128&q=75" className="shopee"></img>
                </div>
                <div class="infor">
                    <p>KẾT NỐI</p>
                    <div className="image-container">
                        <img src="https://onthisinhvien.com/_next/image?url=%2Fimages%2Ficon%2Fotsv%2Fchplay-download.png&w=384&q=75"></img>
                        <img src="https://onthisinhvien.com/_next/image?url=%2Fimages%2Ficon%2Fotsv%2Fapp-store-download.png&w=384&q=75"></img>
                    </div>
                    <a>Kết nối với chúng tôi</a>
                    <div className="connect-ft">
                        <img src="https://onthisinhvien.com/images/icon/otsv/youtube.svg"></img>
                        <img src="https://onthisinhvien.com/images/icon/otsv/fb.svg"></img>
                        <img src="https://onthisinhvien.com/images/icon/otsv/tiktok.svg"></img>
                        <img src="https://onthisinhvien.com/_next/image?url=%2Fimages%2Ficon%2Fotsv%2Fins.png&w=1920&q=75"></img>
                    </div>
                </div>
            </div>
        </div>
        <div className="footer-2">
            @2023 - Công ty Dược Phẩm Hust
            <br />Giấy chứng nhận đăng ký doanh nghiệp số: 123456789, cấp bởi Sở kế hoạch và đầu tư TP. Hà Nội
        </div>
       </div>
    )
}

export default Footer;