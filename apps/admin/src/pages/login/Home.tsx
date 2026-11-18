import LoginCard from "./components/LoginCard";

export default function Home() {
  return (
    <div className="h-screen w-screen flex bg-white">
      <div className="flex flex-1 items-center justify-center px-6">
        <LoginCard />
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center">
        <div className="w-full h-full rounded-3xl overflow-hidden">
          <img
            src="/img/auth-side-bg.png"
            alt="Login Art"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
