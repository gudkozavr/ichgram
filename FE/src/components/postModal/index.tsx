import React, { useState, ChangeEvent, useEffect } from "react";
import { Modal } from "@mui/material";
import axios from "axios";
import like from "../../assets/icons/like.svg";
import likedFot from "../../assets/icons/liked.svg";
import comentImg from "../../assets/icons/dialog.svg";
import { useSwipeable } from "react-swipeable";
export interface UserDetails {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  password: string;
  mustChangePassword: boolean;
  role: string;
  profile: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Тип для профиля пользователя
export interface UserProfile {
  _id: string;
  user: string;
  bio: string;
  gender: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  interests: string[];
  occupation: string;
  education: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  repostedPosts: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  avatar: string;
}

// Тип для комментария
export interface Comment {
  _id: string;
  content: string;
  likes: string[];
  repliesCount: number;
  username: string;
  avatar: string;
  isLiked?: boolean;
}

// Тип для поста
export interface PostDetails {
  _id: string;
  content: string;
  imageUrls: string[];
  videoUrl: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  userDetails: UserDetails;
  userProfile: UserProfile;
  comments: Comment[];
}
// Тип для общего ответа API
export interface ApiResponse {
  message: string;
  data: PostDetails;
}

interface PostModalProps {
  openModal: boolean;
  handleCloseModal: () => void;
  selectedPost: PostDetails | null;
  handleOpenCommentsModal: () => void;
  openCommentsModal: boolean;
  handleCloseCommentsModal: () => void;
  handleCommentSubmit: () => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  // likeComment: (commentId: string) => void;
  toggleLikeComment: (commentId: string) => void;
}

// Компонент PostModal с типизацией пропсов
const PostModal: React.FC<PostModalProps> = ({
  openModal,
  handleCloseModal,
  selectedPost,
  handleOpenCommentsModal,
  openCommentsModal,
  handleCloseCommentsModal,
  handleCommentSubmit,
  newComment,
  setNewComment,
  toggleLikeComment,
}) => {
  const username = localStorage.getItem("username");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpenModal, setIsOpenModal] = useState(true);
  const [deleteConfirmationModal, setDeleteConfirmationModal] =
    useState<boolean>(false);

  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentIndex((prevIndex) =>
        selectedPost?.imageUrls
          ? (prevIndex + 1) % selectedPost.imageUrls.length
          : 0
      ),
    onSwipedRight: () =>
      setCurrentIndex((prevIndex) =>
        selectedPost?.imageUrls
          ? prevIndex === 0
            ? selectedPost.imageUrls.length - 1
            : prevIndex - 1
          : 0
      ),

    trackMouse: true,
  });

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!username) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HOST_NAME}/api/avatar/${username}`
        );

        if (response.data?.data?.avatar) {
          setProfileImage(response.data.data.avatar);
        }
      } catch (error) {
        console.error("Ошибка загрузки аватара", error);
      }
    };

    fetchProfileImage();
  }, [username]);

  const handleDeletePost = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_HOST_NAME}/api/post/${selectedPost?._id}`,

        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setDeleteConfirmationModal(false);
      handleCloseModal();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting post", error);
    }
  };
  return (
    <>
      {/* Основной Modal для поста */}

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto "
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
              setIsOpenModal(false);
              handleCloseModal();
            }
          }}
        >
          <div
            className="relative w-full max-w-3xl p-4 mx-auto my-8 bg-white rounded-lg shadow-lg sm:mx-4"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
            }}
          >
            {selectedPost ? (
              <div className="max-h-[80vh] overflow-y-auto">
                <div className="flex items-center mb-4">
                  <img
                    src={
                      selectedPost.userProfile?.avatar || "default-avatar.png"
                    }
                    alt="user-avatar"
                    className="w-10 h-10 mr-3 rounded-full"
                  />
                  <h1 className="text-lg font-semibold">
                    {selectedPost.userDetails?.username || "Unknown User"}
                    <p className="mb-4 text-sm text-gray-500">
                      {selectedPost.createdAt
                        ? new Date(selectedPost.createdAt).toLocaleDateString()
                        : "No Date"}
                    </p>
                  </h1>
                  <span
                    onClick={() => {
                      if (selectedPost.userDetails?.username === username) {
                        setDeleteConfirmationModal(true);
                      }
                    }}
                    className={`mb-3 ml-auto text-lg font-medium text-right text-gray-800 transition-transform duration-300 cursor-pointer hover:text-slate-950 hover:scale-105 mr-3${
                      selectedPost.userDetails?.username === username
                        ? ""
                        : "hidden"
                    }`}
                  >
                    delete post
                  </span>
                  {/* Дотсы */}
                </div>

                <div className="relative mb-4" {...handlers}>
                  {selectedPost.imageUrls?.length > 0 ? (
                    <>
                      {" "}
                      <img
                        className="w-full h-auto rounded-lg"
                        src={selectedPost.imageUrls[currentIndex]}
                        alt="post"
                      />
                      {selectedPost.imageUrls?.length > 1 && (
                        <div className="absolute flex space-x-2 transform -translate-x-1/2 bottom-4 left-1/2">
                          {selectedPost.imageUrls.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all ${
                                index === currentIndex
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : selectedPost.videoUrl ? (
                    <video className="w-full h-auto rounded-lg" controls>
                      <source src={selectedPost.videoUrl} />
                    </video>
                  ) : null}
                </div>

                <p className="mb-4 text-sm text-gray-700">
                  {selectedPost.content || "No content available"}
                </p>

                <div className="flex items-center mb-4">
                  <span className="mr-2 font-semibold">
                    {selectedPost.likesCount} likes
                  </span>
                  <span className="ml-2 font-semibold">
                    {selectedPost.commentsCount} comments
                  </span>
                  <img
                    src={comentImg}
                    onClick={handleOpenCommentsModal}
                    className="w-6 h-6 mb-1 ml-10 transition-transform cursor-pointer hover:scale-105"
                  />
                  <div className="flex">
                    {selectedPost.likesCount > 3 && (
                      <span className="text-sm text-gray-500">
                        +{selectedPost.likesCount - 3} ещё
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading post details...</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal для комментариев */}
      <Modal open={openCommentsModal} onClose={handleCloseCommentsModal}>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
              setIsOpenModal(false);
              handleCloseCommentsModal();
            }
          }}
        >
          <div
            className="relative w-full max-w-3xl p-4 mx-auto my-8 bg-white rounded-lg shadow-lg sm:mx-4"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
            }}
          >
            {selectedPost ? (
              <div className="max-h-[80vh] overflow-y-auto">
                <span
                  onClick={handleCloseCommentsModal}
                  className="mt-4 text-gray-800 transition-transform duration-300 cursor-pointer hover:text-slate-950 hover:scale-105 "
                >
                  Beck to post
                </span>

                <div className="mt-4 mb-4">
                  {Array.isArray(selectedPost?.comments) &&
                  selectedPost.comments.length > 0 ? (
                    selectedPost.comments.map((comment, index) => (
                      <div
                        key={index}
                        className="flex flex-row items-center mb-4 sm:flex-row sm:items-center sm:w-full"
                      >
                        {/* Имя и Фото комментатора */}
                        <div className="flex items-center">
                          <img
                            src={
                              comment.avatar
                                ? comment.avatar
                                : `${profileImage}`
                            }
                            alt="comment-user-avatar"
                            className="w-8 h-8 mr-3 rounded-full"
                          />
                          <span className="mr-10 font-semibold">
                            {comment.username ? comment.username : username}
                          </span>
                        </div>

                        {/* Комментарий */}
                        <div className="flex-1 min-w-[214px] ">
                          <div className="flex space-x-2">
                            <p className="overflow-hidden text-sm text-gray-800 break-words text-ellipsis sm:max-h-none sm:text-base ">
                              {comment.content}
                            </p>
                          </div>
                        </div>

                        {/* Лайк */}
                        <img
                          src={comment.isLiked ? likedFot : like}
                          alt="like"
                          onClick={() => toggleLikeComment(comment._id)}
                          className="w-6 h-6 ml-2 cursor-pointer sm:ml-4"
                        />
                      </div>
                    ))
                  ) : (
                    <p>No comments yet..</p>
                  )}
                </div>
                <div className="relative mb-4">
                  <textarea
                    placeholder="add your comment..."
                    className="w-full p-2 pb-12 border border-gray-300 rounded-lg resize-none"
                    rows={4}
                    value={newComment}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setNewComment(e.target.value)
                    }
                  />
                  <span
                    onClick={handleCommentSubmit}
                    className="absolute px-0 py-1 text-blue-700 rounded-lg cursor-pointer right-4 bottom-4 hover:text-blue-900"
                  >
                    send
                  </span>
                </div>
              </div>
            ) : (
              <p>Loading posts...</p>
            )}
          </div>
        </div>
      </Modal>
      {/* Modal подтверждения удаления */}
      <Modal
        open={deleteConfirmationModal}
        onClose={() => setDeleteConfirmationModal(false)}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div className="relative w-full max-w-sm p-4 mx-auto my-8 bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-center">
              Are you sure you want to delete this post?
            </h2>
            <div className="flex justify-between">
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Delete Post
              </button>
              <button
                onClick={() => setDeleteConfirmationModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Back to Post
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PostModal;
