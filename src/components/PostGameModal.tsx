import React, { useRef, useEffect } from "react";

type PostGameModalProps = {
  totalPoints: number;
  correctAnswers: number;
  toggled: boolean;
  closeModal: () => void;
};

const PostGameModal = ({
  totalPoints,
  correctAnswers,
  toggled,
  closeModal,
}: PostGameModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickedOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node))
        closeModal();
    };

    if (toggled) document.addEventListener("mousedown", clickedOutside);
    return () => {
      document.removeEventListener("mousedown", clickedOutside);
    };
  }, [toggled, closeModal]);

  return (
    <div
      ref={modalRef}
      className={`${toggled ? "modal-open" : "modal-close"} w-1/4 h-auto rounded-lg bg-slate-800 border border-slate-600 z-10 text-slate-400 transition-transform duration-300`}
    >
      <img
        className="w-1/5 min-w-10 h-auto m-4"
        src={`${process.env.PUBLIC_URL}/images/celebration.png`}
        alt="celebration-art"
        loading="lazy"
      />
      <div className="font-bold text-clamp-l m-2">Game Over!</div>
      <div className="m-2 text-clamp">
        You got {correctAnswers} correct for a total of {totalPoints}pts!
      </div>
    </div>
  );
};

export default PostGameModal;
