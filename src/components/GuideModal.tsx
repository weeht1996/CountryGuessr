import { useEffect, useRef } from "react";

type GuideModalProps = {
  toggled: boolean;
  closeModal: () => void;
};

const GuideModal = ({ toggled, closeModal }: GuideModalProps) => {
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
      className={`${toggled ? "modal-open" : "modal-close"} sm:w-auto w-11/12 h-auto rounded-lg bg-slate-400 border border-slate-600 z-10 text-slate-800 transition-transform duration-300`}
    >
      <h1 className="text-clamp-l mt-6 flex justify-center font-extrabold">
        Guess the Country
      </h1>
      <div className="w-4/5">
        <ul className="list-disc space-y-3 ml-6 text-left my-6">
          <li>Your goal is to guess the country </li>
          <li>
            Click on the main bar ???? or the{" "}
            <img
              src={`${process.env.PUBLIC_URL}/images/arrow-down-up-svgrepo-com.svg `}
              alt="updown"
              className="w-6 h-auto inline"
            />{" "}
            to expand the card for hints
          </li>
          <li>Hints can be revealed by trading in points</li>
          <li>
            You get 15 attempts total. You can choose to give up, once all 5
            countries have been completed, the game ends
          </li>
          <li>
            You can refresh at any point but records will be saved locally
            regardless
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GuideModal;
