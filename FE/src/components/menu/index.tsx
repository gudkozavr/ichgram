import { useState, useEffect } from "react";
import axios from "axios";
import {
  HomeIcon,
  SearchIcon,
  ExploreIcon,
  MessagesIcon,
  NotificationIcon,
  CreateIcon,
  ProfileIcon,
} from "../../assets/menu_icons/index";
import MenuItem from "../../ui/menu_item/index";

const Menu = () => {
  const username = localStorage.getItem("username");
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  const menuItems = [
    { name: "Home", path: "/", icon: <HomeIcon /> },
    { name: "Search", path: "/search", icon: <SearchIcon /> },
    {
      name: "Create",
      path: "/create",
      icon: <CreateIcon />,
    },
    {
      name: "Explore",
      path: "/explore",
      icon: <ExploreIcon />,
      hideOnMobile: true,
    },
    { name: "Messages", path: "/messages", icon: <MessagesIcon /> },
    {
      name: "Notifications",
      path: "/notification",
      icon: <NotificationIcon />,
      hideOnMobile: true,
    },

    {
      name: "Profile",
      path: `/profile/${username}`,
      icon: profileImage ? (
        <img
          src={profileImage}
          alt="Profile"
          className="object-cover w-8 h-8 rounded-full"
        />
      ) : (
        <ProfileIcon />
      ),
    },
  ];

  return (
    <div className="flex flex-row w-20%">
      {/* Меню на больших экранах */}
      <div className="z-50 hidden p-3 bg-white border-r md:flex md:flex-col w-max z-2000">
        {menuItems.map(({ name, path, icon }) => (
          <MenuItem
            key={path}
            name={name}
            path={path}
            icon={icon}
            isMobile={false}
          />
        ))}
      </div>

      {/* Меню на мобильных устройствах */}
      <div className="fixed bottom-0 left-0 z-50 w-full p-3 bg-white border-t md:hidden">
        <div className="flex justify-around">
          {menuItems
            .filter(({ hideOnMobile }) => !hideOnMobile)
            .map(({ name, path, icon }) => (
              <MenuItem
                key={path}
                name={name}
                path={path}
                icon={icon}
                isMobile={true}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;
