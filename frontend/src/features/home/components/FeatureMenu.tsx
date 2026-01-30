"use client";
import feature_menu_cheap from "@/src/assest/feat_menu_cheap.png";
import feature_menu_special from "@/src/assest/feat_menu_special.png";
import feature_menu_flash_sale from "@/src/assest/feat_menu_flash_sale.png";
import feature_menu_style from "@/src/assest/feat_menu_style.png";
import feature_menu_label from "@/src/assest/feat_menu_label.png";
import feature_menu_voucher from "@/src/assest/feat_menu_voucher.png";
import Image from "next/image";

const FeatureMenu = () => {
  return (
    <div className="flex items-center justify-center">
      <div
        className="flex-1 flex items-center justify-center"
        onClick={() => {
          console.log("abc");
        }}
      >
        <div className="w-[70%] flex flex-col gap-3 items-center justify-center cursor-pointer">
          <Image
            className="w-[45px] h-[45px] object-cover"
            src={feature_menu_cheap}
            alt="feature_menu_cheap"
          />
          <span className="text-sm text-center">Deal Từ 1.000Đ</span>
        </div>
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3"
        onClick={() => {
          console.log("abc1");
        }}
      >
        <div className="w-[70%] flex flex-col gap-3 items-center justify-center cursor-pointer">
          <Image
            className="w-[45px] h-[45px] object-cover"
            src={feature_menu_special}
            alt="feature_menu_special"
          />
          <span className="text-sm text-center">Shopee Xử Lý</span>
        </div>
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3"
        onClick={() => {
          console.log("abc2");
        }}
      >
        <div className="w-[70%] flex flex-col gap-3 items-center justify-center cursor-pointer">
          <Image
            className="w-[45px] h-[45px] object-cover"
            src={feature_menu_flash_sale}
            alt="feature_menu_flash_sale"
          />
          <span className="text-sm text-center">Deal Hot Giờ Vàng</span>
        </div>
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3"
        onClick={() => {
          console.log("abc");
        }}
      >
        <div className="w-[70%] flex flex-col gap-3 items-center justify-center cursor-pointer">
          <Image
            className="w-[45px] h-[45px] object-cover"
            src={feature_menu_style}
            alt="feature_menu_style"
          />
          <span className="text-sm text-center">Shopee Style Voucher 30%</span>
        </div>
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3 "
        onClick={() => {
          console.log("abc");
        }}
      >
        <div className="w-[50%] flex flex-col gap-3 items-center justify-center cursor-pointer">
          <Image
            className="w-[45px] h-[45px] object-cover"
            src={feature_menu_label}
            alt="feature_menu_label"
          />
          <span className="text-sm text-center">Khách Hàng Thân Thiết</span>
        </div>
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3"
        onClick={() => {
          console.log("abc");
        }}
      >
        <div className="w-[70%] flex flex-col gap-3 items-center justify-center  cursor-pointer">
          <Image
            className="w-[45px] h-[45px] object-cover"
            src={feature_menu_voucher}
            alt="feature_menu_voucher"
          />
          <span className="text-sm text-center">Mã Giảm Giá</span>
        </div>
      </div>
    </div>
  );
};

export default FeatureMenu;
