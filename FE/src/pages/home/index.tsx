import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MediaSlider from '../../components/post';
import { jwtDecode } from 'jwt-decode';
import PostModal from '../../components/postModal';
import { PostDetails } from '../../components/postModal';

import { Comment } from '../../components/postModal';

interface IProfile {
  _id: string;
  avatar: string;
}

interface IUser {
  _id: string;
  username: string;
  profile: IProfile;
  avatar: string;
}

export interface IPost {
  _id: string;
  user: IUser;
  content: string;
  imageUrls: string[];
  videoUrl: string;
  likesCount: number;
  likes: any[];
  comments: Comment[];
  createdAt: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPost, setSelectedPost] = useState<PostDetails | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openCommentsModal, setOpenCommentsModal] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');

  const getUserIdFromToken = (): string => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.id;
      } catch (error) {
        console.error('Error decoding token:', error);
        return '';
      }
    }
    return '';
  };

  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HOST_NAME}/api/post/following`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setPosts(response.data.data.posts);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при загрузке постов');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const fetchPostDetails = async (postId: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_NAME}/api/post/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const post = response.data.data;

      const filteredComments = post.comments.filter(
        (comment: Comment) =>
          comment.content !== 'No content' && 
          comment.username !== 'Anonymous' && 
          comment.avatar !== 'default-avatar.png'
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
      setError(err.response?.data?.message || 'Ошибка при загрузке поста');
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
            Authorization: `Bearer ${localStorage.getItem('token')}`,
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

      setNewComment('');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Ошибка при добавлении комментария'
      );
    }
  };

  const toggleLikeComment = async (commentId: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/comment/${commentId}/togglelike`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
      setError(err.response?.data?.message || 'Ошибка при лайке комментария');
    }
  };
  if (loading) {
    return <div>Loading..</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (posts.length === 0) {
    return <div>There are no posts from people you follow yet.</div>;
  }
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post._id}
              className="w-full overflow-hidden bg-white rounded-lg shadow-lg"
            >
              <MediaSlider
                media={
                  post.imageUrls.length > 0
                    ? post.imageUrls
                    : [post.videoUrl || '']
                }
                avatar={post.user.avatar}
                onClick={() => handleOpenModal(post._id)}
                author={post.user.username}
                date={new Date(post.createdAt).toDateString()}
                likecount={post.likesCount}
                description={post.content}
                postId={post._id}
                userId={userId || ''}
                likes={post.likes}
              />
            </div>
          ))
        ) : (
          <div className="text-center">Нет постов для отображения.</div>
        )}
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

export default Home;
