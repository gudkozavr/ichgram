import LoginForm from "../../components/loginForm";
import Tell from "../../assets/main_image/phones.svg";

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex items-center justify-center w-full max-w-4xl p-4">
        {/* Картинка */}
        <img
          src={Tell}
          alt="Logo"
          className="hidden w-[380px] h-[580px]  mr-8 md:block" // Скрываем на мобильных устройствах
        />

        {/* Форма логина */}
        <div className="w-full max-w-sm md:w-1/2">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
