import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  modal?: ReactNode;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, modal, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
       
        className="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg sm:ml-24"
        onClick={(e) => e.stopPropagation()} 
      >
       
        <div className="flex items-center justify-between pb-2 border-b">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {modal && <div className="flex-shrink-0">{modal}</div>}
        </div>

        
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
