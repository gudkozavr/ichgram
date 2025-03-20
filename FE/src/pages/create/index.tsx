import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Modal from "../../components/modal";
import Button from "../../ui/button";
import Input from "../../ui/input";
import upload from "../../assets/icons/upload.jpg";
const ModalData = () => {
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const location = useLocation();

  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false); // Индикатор загрузки
  const [error, setError] = useState(""); // Для отображения ошибок

  // Определяем, открыта ли модалка, по URL
  const isModalOpen = location.pathname === "/create";
  const isShareModalOpen = location.pathname === "/create/share";

  // Валидация формата файла
  const validateFile = (file: File): boolean => {
    const validFormats = /\.(jpeg|jpg|png|gif|mp4)$/i;
    return validFormats.test(file.name);
  };

  // Обработка загрузки файлов
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const validFiles: File[] = [];
    let invalidFileFound = false;

    Array.from(selectedFiles).forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
      } else {
        invalidFileFound = true;
      }
    });

    if (invalidFileFound) {
      setError(
        "Only files with formats jpeg, jpg, png, gif, or mp4 are allowed."
      );
    } else {
      setError("");
    }

    setFiles(validFiles);
  };

  // Создание поста
  const handleCreatePost = async () => {
    if (files.length === 0 && !text.trim()) {
      console.error("Please add content or upload a file.");

      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // Добавляем файлы
      files.forEach((file) =>
        formData.append(
          file.type.startsWith("image") ? "images" : "video",
          file
        )
      );

      // Добавляем текст
      formData.append("content", text || " ");

      // Отправляем запрос на сервер
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_NAME}/api/post/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        navigate(`/profile/${username}`);
      } else {
        console.error("Failed to create post.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Первая модалка */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => navigate(`/profile/${username}`)}
        title="Create Post"
        modal={
          <Button variant="secondary" onClick={() => navigate("/create/share")}>
            Share
          </Button>
        }
      >
        <div className="flex w-full mt-4 h-96">
          {/* Загрузка файлов */}
          <div className="flex flex-col items-center justify-center w-1/2 gap-4 border-r">
            <label className="text-blue-500 cursor-pointer">
              (jpeg, jpg, png, gif, mp4)
              <img src={upload} alt="upload file" className="w-20 m-auto" />
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
              />
            </label>
            {error && <p className="text-red-500">{error}</p>}

            {/* Предпросмотр файлов */}
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="relative w-24 h-24">
                  {file.type.startsWith("image") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      className="object-cover w-full h-full"
                      controls
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Поле для комментариев */}
          <div className="flex flex-col w-1/2 pl-4 border-b border-gray-300 h-[50%]">
            <Input
              type="textarea"
              className="border-none min-h-1/2 focus:outline-none"
              placeholder="Write your comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Вторая модалка */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => navigate(`/profile/${username}`)}
        title="Share Post"
      >
        <div className="flex flex-col gap-4">
          <Button variant="secondary" onClick={() => navigate("/create")}>
            Back to Create Post
          </Button>
          <Button
            variant="primary"
            onClick={handleCreatePost}
            disabled={loading || files.length === 0} // Блокируем кнопку при загрузке
          >
            {loading ? "Creating..." : "Create Post"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/profile/${username}`)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ModalData;
