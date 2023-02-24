import React, { useState, ReactNode } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import { cls } from "../../utils/css";
import "./menu.less";

interface MenuProps {
  children: ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useClickOutside(() => setIsOpen(false));

  const className = "menu";

  return (
    <div className={className} ref={ref}>
      <button
        className={`${className}__button`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        &#8943;
      </button>
      <div
        className={cls(
          `${className}__items`,
          isOpen && `${className}__items--open`
        )}
      >
        {children}
      </div>
    </div>
  );
};

interface MenuItemProps {
  red?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  red,
  onClick,
  children,
}) => {
  const className = `menu__items__item`;
  return (
    <div
      className={cls(className, red && `${className}--red`)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
