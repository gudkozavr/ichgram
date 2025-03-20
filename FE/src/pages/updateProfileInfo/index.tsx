import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

const UpdateProfileInfo = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setError("Token not found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HOST_NAME}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { data } = response.data;
        setInitialData(data);

        setValue("bio", data.bio || "");
        setValue("gender", data.gender || "other");
        setValue("interests", data.interests.join(", ") || "");
        setValue("city", data.address?.city || "");
        setValue("state", data.address?.state || "");
        setValue("country", data.address?.country || "");
      } catch (err) {
        setError("Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, setValue]);

  const onSubmit = async (data: any) => {
    if (!token) {
      setError("Token not found");
      return;
    }

    try {
      const updatedData = {
        ...data,
        interests: data.interests
          .split(", ")
          .map((interest: string) => interest.trim()),
        address: {
          city: data.city,
          state: data.state,
          country: data.country,
        },
      };

      await axios.put(
        `${import.meta.env.VITE_HOST_NAME}/api/profile`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      setError("Failed to update profile data");
    }
  };

  if (loading) return <div className="mt-10 text-center">Loading...</div>;
  if (error)
    return <div className="mt-10 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col items-center  p-4  pt-9 overflow-y-auto bg-gray-100 h-[800px]">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-center text-gray-800">
          Edit Profile
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Bio
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 mt-1 text-gray-700 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Tell us about yourself"
              {...register("bio")}
              defaultValue={initialData?.bio}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Gender
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 mt-1 text-gray-700 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Gender (e.g., male, female, other)"
              {...register("gender")}
              defaultValue={initialData?.gender}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Interests
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 mt-1 text-gray-700 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Comma-separated interests (e.g., swim, jog)"
              {...register("interests")}
              defaultValue={initialData?.interests}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                City
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 text-gray-700 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="City"
                {...register("city")}
                defaultValue={initialData?.address?.city}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                State
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 text-gray-700 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="State"
                {...register("state")}
                defaultValue={initialData?.address?.state}
              />
            </div>
            <div className="col-span-full sm:col-span-1">
              <label className="block text-sm font-medium text-gray-600">
                Country
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 text-gray-700 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Country"
                {...register("country")}
                defaultValue={initialData?.address?.country}
              />
            </div>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="w-full py-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileInfo;
