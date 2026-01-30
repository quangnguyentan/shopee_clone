import Categories from "@/src/features/home/components/Categories";
import FeatureMenu from "@/src/features/home/components/FeatureMenu";
import FlashSale from "@/src/features/home/components/FlashSale";
import HeroSection from "@/src/features/home/components/HeroSection";
import ProductList from "@/src/features/home/components/ProductList";
import ShopeeMall from "@/src/features/home/components/ShopeeMall";
import TopSearch from "@/src/features/home/components/TopSearch";

const Home = () => {
  return (
    <div>
      <div className="space-y-6 w-full bg-white">
        <div className="max-w-screen-xl mx-auto px-12 py-6 flex flex-col gap-8">
          <HeroSection />
          <FeatureMenu />
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-12 flex flex-col space-y-4 py-4">
        <div className="bg-white rounded-md w-full">
          <Categories />
        </div>
        <div className="bg-white rounded-md w-full">
          <FlashSale />
        </div>
        <div className="bg-white rounded-md w-full">
          <ShopeeMall />
        </div>
        <div className="bg-white rounded-md w-full">
          <TopSearch />
        </div>
        <div className="rounded-md w-full">
          <ProductList />
        </div>
      </div>
    </div>
  );
};

export default Home;
