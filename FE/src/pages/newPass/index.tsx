import NewPass from "../../components/newPass";
const NewPassPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      

        {/* Форма логина */}
        <div className="w-full max-w-sm md:w-1/2">
          <NewPass />
        </div>
      
    </div>
  );
};

export default NewPassPage;
