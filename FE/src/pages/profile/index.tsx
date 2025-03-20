import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Button from "../../ui/button";
import MediaSlider from "../../components/post";
import { jwtDecode } from "jwt-decode";
import PostModal, { PostDetails } from "../../components/postModal";

import { Comment } from "../../components/postModal";

interface IUserProfile {
  user: {
    _id: string;
    username: string;
  };
  avatar?: string;
  bio: string;
  gender: "male" | "female" | "other";
  address: {
    city?: string;
    state?: string;
    country?: string;
  };
  interests: string[];
  occupation?: string;
  education?: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  repostedPosts: string[];
  postsCount: number;
}

import { IPost } from "../home";

const Profile = () => {
  const navigate = useNavigate();
  const { username: urlUsername } = useParams<{ username: string }>();

  const currentUsername = localStorage.getItem("username");
  const username = urlUsername || currentUsername;

  const [user, setUser] = useState<IUserProfile | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const [selectedPost, setSelectedPost] = useState<PostDetails | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openCommentsModal, setOpenCommentsModal] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");

  const getUserIdFromToken = (): string => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.id;
      } catch (error) {
        console.error("Error decoding token:", error);
        return "";
      }
    }
    return "";
  };

  const userId = getUserIdFromToken();
  console.log("userId", userId);
  useEffect(() => {
    if (!username) {
      setError("Имя пользователя не найдено");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Токен не найден");

        const response = await axios.get<{ data: IUserProfile }>(
          `${import.meta.env.VITE_HOST_NAME}/api/profile/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userProfile = response.data.data;
        setUser(userProfile);
        console.log(userProfile);
        setAvatar(userProfile.avatar || "");

        // Установить статус подписки
        setIsFollowing(userProfile.followers.includes(userId));
      } catch (err) {
        setError("Ошибка загрузки профиля");
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Токен не найден");

        const response = await axios.get<{ data: IPost[] }>(
          `${import.meta.env.VITE_HOST_NAME}/api/post/user-posts/${username}`,
          {
            headers: {
              Authorization: ` Bearer ${token}`,
            },
          }
        );
        setPosts(response.data.data);
      } catch (err) {
        setError("Ошибка загрузки постов");
      }
    };

    const fetchData = async () => {
      await fetchProfile();
      await fetchPosts();
    };

    fetchData();
  }, [username, userId]);

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Токен не найден");

      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/follow/${username}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsFollowing((prev) => !prev);
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              followersCount: isFollowing
                ? prevUser.followersCount - 1
                : prevUser.followersCount + 1,
            }
          : null
      );
    } catch (error) {
      console.error("Ошибка подписки/отписки:", error);
      setError("Ошибка выполнения действия");
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Токен не найден");

      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/upload-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const avatarUrl = response.data.data.avatar;
      setAvatar(avatarUrl);
    } catch (err) {
      setError("Ошибка загрузки аватара");
    }
  };

  const fetchPostDetails = async (postId: string) => {
    console.log(postId);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_NAME}/api/post/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const post = response.data.data;

      const filteredComments = post.comments.filter(
        (comment: Comment) =>
          comment.content !== "No content" &&
          comment.username !== "Anonymous" &&
          comment.avatar !== "default-avatar.png"
      );

      const updatedComments = filteredComments.map((comment: Comment) => ({
        ...comment,
        isLiked: comment.likes.includes(userId),
      }));

      setSelectedPost({
        ...post,
        comments: updatedComments,
      });
      setOpenModal(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Ошибка при загрузке поста");
    }
  };
  const handleOpenModal = (postId: string) => {
    fetchPostDetails(postId);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPost(null);
  };

  const handleOpenCommentsModal = () => {
    setOpenCommentsModal(true);
  };

  const handleCloseCommentsModal = () => {
    setOpenCommentsModal(false);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/post/${
          selectedPost._id
        }/comment`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Обновляем комментарии для текущего поста
      const updatedComment = response.data.data;
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), updatedComment],
              commentsCount: prev.commentsCount + 1,
            }
          : null
      );

      // Обновляем комментарии на главной странице
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPost._id
            ? { ...post, comments: [...(post.comments || []), updatedComment] }
            : post
        )
      );

      setNewComment("");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Ошибка при добавлении комментария"
      );
    }
  };

  const toggleLikeComment = async (commentId: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/comment/${commentId}/togglelike`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const updatedComment = response.data.data;

      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((comment) =>
                comment._id === commentId
                  ? {
                      ...comment,
                      likes: updatedComment.likes,
                      isLiked: updatedComment.likes.includes(userId),
                    }
                  : comment
              ),
            }
          : null
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка при лайке комментария");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>Profile not found</p>;

  const profileLink: string = `${window.location.origin}/profile/${user.user.username}`;
  const canEditProfile = user.user.username === currentUsername;

  return (
    <div className="w-full max-w-6xl px-4 py-8 mx-auto">
      <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-8">
        <div
          className="relative flex items-center justify-center w-24 h-24 mt-2 ml-4 mr-6 bg-gray-300 rounded-full cursor-pointer sm:w-28 sm:h-28 md:w-32 md:h-32"
          onClick={() =>
            canEditProfile && document.getElementById("avatarInput")?.click()
          }
        >
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-full h-full rounded-full"
            />
          ) : (
            <span className="text-gray-500">Фото</span>
          )}
          <input
            type="file"
            id="avatarInput"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={!canEditProfile}
          />
        </div>

        <div className="flex flex-col items-center md:items-start">
          <div className="flex flex-col items-center mt-2 space-y-2 md:flex-row md:space-y-0 md:space-x-5">
            <h2 className="text-lg font-semibold sm:text-2xl md:text-3xl lg:text-4xl ">
              {user.user.username}
            </h2>
            {canEditProfile ? (
              <>
                <Button
                  variant="secondary"
                  className="p-1 text-black bg-gray-300 hover:bg-gray-300"
                  onClick={() => navigate("/profile-info")}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="secondary"
                  className="p-1 text-black bg-gray-300 hover:bg-gray-300"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("username");
                    navigate("/login");
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                className="pb-[3px] p-1b text-zinc-950"
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
          <div className="flex justify-center mt-3 space-x-4 text-xs sm:text-sm md:text-base md:justify-start">
            <span>
              <strong>{user.postsCount}</strong> posts
            </span>
            <span>
              <strong>{user.followersCount}</strong> followers
            </span>
            <span>
              <strong>{user.followingCount}</strong> following
            </span>
          </div>

          <p className="mt-3 text-xs sm:text-sm md:text-base">{user.bio}</p>

          <Button
            variant="secondary"
            className="mt-2 text-xs text-blue-500 sm:text-sm md:text-base"
            onClick={() => navigator.clipboard.writeText(profileLink)}
          >
            {profileLink}
          </Button>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        {posts.map((post) => (
          <div
            key={post._id}
            className="z-20 w-full bg-gray-200 aspect-square overflow-y-clip"
          >
            <MediaSlider
              onClick={() => handleOpenModal(post._id)}
              media={
                post.imageUrls.length > 0 ? post.imageUrls : [post.videoUrl]
              }
              avatar={avatar || ""}
              author={post.user?.username || ""}
              date={new Date(post.createdAt).toDateString()}
              likecount={post.likesCount}
              description={post.content}
              postId={post._id}
              userId={userId}
              likes={post.likes}
            />
          </div>
        ))}
      </div>

      {selectedPost && (
        <PostModal
          openModal={openModal}
          handleCloseModal={handleCloseModal}
          selectedPost={selectedPost}
          handleOpenCommentsModal={handleOpenCommentsModal}
          openCommentsModal={openCommentsModal}
          handleCloseCommentsModal={handleCloseCommentsModal}
          handleCommentSubmit={handleCommentSubmit}
          newComment={newComment}
          setNewComment={setNewComment}
          toggleLikeComment={toggleLikeComment}
        />
      )}
    </div>
  );
};

export default Profile;
