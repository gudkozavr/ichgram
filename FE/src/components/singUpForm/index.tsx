import { useForm } from "react-hook-form";
import Input from "../../ui/input";
import Button from "../../ui/button";
import { Link, useNavigate } from "react-router-dom";
import inStackLogo from "../../assets/icons/logo_ichgram.svg";
import axios from "axios";
interface SignUpFormData {
  email: string;
  fullName: string;
  username: string;
  password: string;
}

const SignUpForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/auth/register`,
        data
      );
      if (response.status === 201) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return (
    <div className="w-[350px] bg-white border border-gray-300 flex flex-col items-center p-6">
      <img src={inStackLogo} alt="Logo" className="w-48 mb-4" />

      <h3 className="mb-4 text-lg text-center">
        Sign up to see photos and videos from your friends.
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full px-4"
      >
        <Input
          type="email"
          placeholder="Email"
          className="mb-2"
          variant="primary"
          autoComplete="email"
          {...register("email", {
            required: "This field is required",
            pattern: {
              value: emailRegex,
              message: "Invalid email format",
            },
          })}
        />
        {errors.email && (
          <span className="mb-2 text-xs text-red-500">
            {errors.email.message}
          </span>
        )}

        <Input
          type="text"
          placeholder="Full Name"
          className="mb-2"
          variant="primary"
          autoComplete="fullName"
          {...register("fullName", {
            required: "This field is required",
          })}
        />
        {errors.fullName && (
          <span className="mb-2 text-xs text-red-500">
            {errors.fullName.message}
          </span>
        )}

        <Input
          type="text"
          placeholder="Username"
          className="mb-2"
          variant="primary"
          autoComplete="username"
          {...register("username", {
            required: "This field is required",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters",
            },
          })}
        />
        {errors.username && (
          <span className="mb-2 text-xs text-red-500">
            {errors.username.message}
          </span>
        )}

        <Input
          type="password"
          placeholder="Password"
          className="mb-2"
          variant="primary"
          autoComplete="new-password"
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
          Sign Up
        </Button>
      </form>

      <div className="mt-4 text-xs text-center text-gray-600">
        <p>
          People who use our service may have uploaded your contact information
          to Instagram.{" "}
          <Link to="/learn-more" className="text-blue-500">
            Learn More
          </Link>
        </p>
        <p>
          By signing up, you agree to our{" "}
          <Link to="/terms" className="text-blue-500">
            Terms
          </Link>
          ,{" "}
          <Link to="/privacy" className="text-blue-500">
            Privacy
          </Link>
          ,{" "}
          <Link to="/cookies" className="text-blue-500">
            Cookies Policy
          </Link>
        </p>
      </div>

      <div className="w-full pt-3 mt-4 text-center border-t">
        <span className="text-sm text-gray-600">
          Have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-500">
            Log in
          </Link>
        </span>
      </div>
    </div>
  );
};

export default SignUpForm;
