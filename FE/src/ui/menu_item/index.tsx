import { ReactNode, FC } from "react";
import { NavLink } from "react-router-dom";

interface MenuItemP {
  icon: ReactNode;
  name: string;
  path: string;
  isMobile: boolean;
}

const MenuItem: FC<MenuItemP> = ({ icon, name, path, isMobile }) => {
  return (
    <NavLink
      to={path}
      className={`no-underline p-3 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-all duration-300 ${
        isMobile ? 'text-gray-600' : 'text-black'
      }`}
      end
    >
      {({ isActive }) => (
        <div
          className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-300 ${
            isActive ? 'bg-gray-200 font-bold text-slate-950' : 'text-gray-600'
          }`}
        >
          <div
            className={`transform transition-all duration-300 ${
              isActive ? 'scale-110 text-slate-950' : ''
            }`}
          >
            {icon}
          </div>

          {/* Только для десктопной версии отображаем текст */}
          {!isMobile && (
            <p
              className={`transition-all duration-300 ${
                isActive
                  ? 'font-bold text-slate-800'
                  : 'font-normal text-gray-600'
              }`}
            >
              {name}
            </p>
          )}
        </div>
      )}
    </NavLink>
  );
};

export default MenuItem;