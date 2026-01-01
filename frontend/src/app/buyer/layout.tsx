import cover_auth from "@/src/assest/cover_auth.png";

const Auth = ({ children }: { children: React.ReactNode }) => {
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
        {children}
      </div>
    </div>
  );
};

export default Auth;
