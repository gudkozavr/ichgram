import { useState } from "react";
import axios from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  username: string;
}

const Search = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ username: string }>();

  const handleSearch = async (query: string) => {
    try {
      if (query.length > 0) {
        setTimeout(async () => {
          const response = await axios.post(
            `${import.meta.env.VITE_HOST_NAME}/api/search`,
            {
              username: query,
            }
          );
          setUsers(response.data);
        }, 500);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError("Failed to search users");
    }
  };

  const handleSubmitSearch: SubmitHandler<{ username: string }> = (data) => {
    handleSearch(data.username);
  };

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="flex flex-col items-center p-4 pt-9 overflow-y-auto bg-gray-100 h-[800px]">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-center text-gray-800">
          Search users by nickname
        </h1>
        <form onSubmit={handleSubmit(handleSubmitSearch)} className="space-y-4">
          <div>
            <input
              type="text"
              className="w-full px-4 py-2 mt-1 text-gray-700 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Type a nickname"
              {...register("username", {
                onChange: (e) => handleSearch(e.target.value),
              })}
            />
          </div>
        </form>

        {error && <div className="mt-4 text-center text-red-500">{error}</div>}

        {users.length > 0 && (
          <div className="mt-4">
            <ul>
              {users.map((user) => (
                <li
                  key={user._id}
                  onClick={() => handleUserClick(user.username)}
                  className="text-blue-500 cursor-pointer hover:text-blue-700"
                >
                  {user.username}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
