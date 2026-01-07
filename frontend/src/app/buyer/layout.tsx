import cover_auth from "@/src/assest/cover_auth.png";
import Header from "@/src/components/shared/Header";

const Auth = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="bg-red-primary h-[600px] w-full flex items-center justify-center">
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
      </main>
    </>
  );
};

export default Auth;
