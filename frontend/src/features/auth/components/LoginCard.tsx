"use client";
import cover_auth from "@/src/assest/cover_auth.png";

const LoginCard = () => {
  return (
    <div className="bg-red-primary h-[600px] w-full flex items-center justify-center">
      <div
        className="relative bg-no-repeat bg-center"
        style={{
          width: "1040px",
          height: "600px",
          backgroundImage: `url(${cover_auth.src})`,
          backgroundSize: "1040px 600px",
        }}
      >
        <div className="absolute top-0 right-0 z-10">abc</div>
      </div>
    </div>
  );
};

export default LoginCard;
