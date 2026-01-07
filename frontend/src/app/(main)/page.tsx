const Home = () => {
  return (
    <div className="space-y-6">
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} className="p-4 bg-gray-200 rounded">
          Home Content #{i + 1}
        </div>
      ))}
    </div>
  );
};

export default Home;
