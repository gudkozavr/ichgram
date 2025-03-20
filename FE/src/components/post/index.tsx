import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import like from "../../assets/icons/like.svg";
import likedFot from "../../assets/icons/liked.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface MediaSliderProps {
  media: string[];
  avatar: string | null;
  author: string;
  date: string;
  likecount: number;
  description: string;
  postId: string;
  userId: string;
  likes: string[];
  onClick: () => void;
}

const MediaSlider: React.FC<MediaSliderProps> = ({
  media,
  avatar,
  author,
  date,
  likecount,
  description,
  postId,
  userId,
  likes,
  onClick,
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likesCount, setLikesCount] = useState(likecount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLikesCount(likecount);
    setLiked(likes.includes(userId));
  }, [likecount, likes, userId]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

  const handleLikeClick = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/post/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const updatedPost = response.data.data;
      setLikesCount(updatedPost.likesCount);
      setLiked(updatedPost.likes.includes(userId));
    } catch (error) {
      console.error("Error to changing like:", error);
    }
  };

  const getMediaType = (url: string) => {
    if (url.endsWith(".mp4") || url.endsWith(".mov")) {
      return "video";
    }
    return "image";
  };

  const onClickToUserProf = () => {
    navigate(`/profile/${author}`);
  };

  const truncateDescription = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div className="border border-gray-300 rounded-lg shadow-md">
      <div className="relative p-4 bg-gray-200 rounded-t-lg">
        <div
          onClick={onClickToUserProf}
          className="absolute top-0 left-0 right-0 flex items-center p-4 bg-white rounded-t-lg cursor-pointer"
        >
          <img
            src={avatar || ""}
            alt="Author Avatar"
            className="object-cover w-10 h-10 rounded-full"
          />
          <div className="flex flex-col pl-4">
            <p className="font-semibold">{author}</p>
            <span className="text-sm text-gray-500">
              {new Date(date).toLocaleString()}
            </span>
          </div>
        </div>

        <div
          {...swipeHandlers}
          className="relative flex items-center justify-center w-full mt-20 bg-black h-80"
          onClick={onClick}
        >
          {media[currentIndex] &&
          getMediaType(media[currentIndex]) === "image" ? (
            <img
              src={media[currentIndex]}
              alt="Media"
              className="object-contain w-full h-full"
            />
          ) : (
            <video
              className="object-contain w-full h-full pointer-events-none"
              controls
              autoPlay
              loop
            >
              <source src={media[currentIndex]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Добавляем дотсы */}
        <div className="absolute flex justify-center w-full pr-5 space-x-2 bottom-5">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? "bg-blue-500" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4 bg-white rounded-b-lg">
        <div className="flex items-center space-x-4">
          <button onClick={handleLikeClick}>
            <img src={liked ? likedFot : like} alt="Like" className="w-6 h-6" />
          </button>
          <span>{likesCount} likes</span>
        </div>
        <div className="h-6">
          <p className="mt-2 text-sm">{truncateDescription(description, 20)}</p>
        </div>
      </div>
    </div>
  );
};

export default MediaSlider;
