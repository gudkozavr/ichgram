import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Input from '../../ui/input';
import Button from '../../ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // добавим useLocation и useNavigate
import lockPass from '../../assets/icons/lock_pass.svg';

interface INewPass {
  password: string;
}

const NewPass = () => {
  const [error, setError] = useState<string | null>(null); 
  const [message, setMessage] = useState<string | null>(null); 
  const { search } = useLocation(); 
  const navigate = useNavigate(); 

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, 
  } = useForm<INewPass>();


  const token = new URLSearchParams(search).get('token');

  const onSubmit = async (data: INewPass) => {
    if (!token) {
      setError('Token is missing or invalid');
      return;
    }

    try {
   
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/reset-password`,
        {
          token,
          newPassword: data.password,
        }
      );

      setMessage(response.data.message);
      setError(null);      
      reset();
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      
      setError(err.response?.data?.message || 'Something went wrong!');
      setMessage(null); 
    }
  };

  return (
    <div className="w-[350px] max-h-[412px] bg-white border border-gray-300 flex flex-col items-center py-6">
      <img src={lockPass} alt="Logo" className="w-24 mt-6 mb-8" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full px-10"
      >
        
        <input
          type="text"
          name="username"
          autoComplete="username"
          value="reset-user"
          hidden
          readOnly
        />

        <Input
          type="password"
          placeholder="New Password"
          className="mb-2"
          variant="primary"
          autoComplete="new-password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Must be at least 6 characters' },
          })}
        />
        {errors.password && (
          <span className="mb-2 text-xs text-red-500">
            {errors.password.message}
          </span>
        )}

        <Button type="submit" variant="primary" className="w-full mt-2">
          Set New Password
        </Button>
      </form>

      {error && <div className="mt-4 text-center text-red-500">{error}</div>}
      {message && (
        <div className="mt-4 text-center text-green-500">{message}</div>
      )}

      <div className="w-full pt-3 mt-4 text-center border-t">
        <Link to="/login" className="font-semibold text-black">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default NewPass;
