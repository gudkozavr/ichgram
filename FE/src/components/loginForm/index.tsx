import { useForm } from "react-hook-form";
import Input from "../../ui/input";
import Button from "../../ui/button";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/icons/logo_ichgram.svg";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
interface ILoginFormData {
  emailOrUsername: string;
  password: string;
}
interface IDecodedToken {
  id: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}
const LoginForm = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginFormData>();

  const onSubmit = async (data: ILoginFormData) => {
    const { emailOrUsername, password } = data;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/auth/login`,
        {
          emailOrUsername, // Передаем только одно поле
          password,
        }
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        const decoded = jwtDecode<IDecodedToken>(response.data.token);
        localStorage.setItem("username", decoded.username);
        navigate(`/profile/${decoded.username}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="w-[350px] h-[412px] bg-white border border-gray-300 flex flex-col items-center">
      <img src={Logo} alt="Logo" className="w-48 mt-6 mb-4" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full px-10"
      >
        <Input
          type="text"
          placeholder="Username or Email"
          className="mb-2"
          variant="primary"
          autoComplete="emailOrUsername"
          {...register("emailOrUsername", {
            required: "This field is required",
            minLength: { value: 3, message: "Must be at least 3 characters" },
            validate: (value) => {
              const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
              if (emailRegex.test(value)) {
                return true;
              }

              if (value.length >= 3) {
                return true;
              }
              return "Please enter a valid email or username";
            },
          })}
        />
        {errors.emailOrUsername && (
          <span className="mb-2 text-xs text-red-500">
            {errors.emailOrUsername.message}
          </span>
        )}

        <Input
          type="password"
          placeholder="Password"
          className="mb-2"
          variant="primary"
          autoComplete="current-password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 6 characters",
            },
          })}
        />
        {errors.password && (
          <span className="mb-2 text-xs text-red-500">
            {errors.password.message}
          </span>
        )}

        <Button type="submit" variant="primary" className="w-full mt-2">
          Log In
        </Button>
      </form>

      <div className="flex items-center w-full px-10 my-3">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="mx-3 text-sm text-gray-500">OR</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>

      <Link to="/forgot-password" className="text-sm text-blue-500">
        Forgot password?
      </Link>

      <div className="w-full pt-3 mt-4 text-center border-t">
        <span className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-blue-500">
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default LoginForm;
