import React, { useCallback, useEffect, useState } from "react";
import { CardState } from "../types/GameRecord";
import CardView from "./CardView";

type CoutryCardListProps = {
  cardStates: CardState[];
  newGame: boolean;
  onHintReveal: (
    country: string,
    hintCost: number,
    hintName: string,
    revealAllHints?: boolean,
  ) => void;
  handleGiveUp: (countryName: string) => void;
};

const CountryCardList = ({
  cardStates,
  newGame,
  onHintReveal,
  handleGiveUp,
}: CoutryCardListProps) => {
  const [isCardExpanded, setIsCardExpanded] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [expandButtonState, setExpandButtonState] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const expandCard = useCallback((idx: number, toExpand: boolean) => {
    setIsCardExpanded((prev) => {
      const updated = [...prev];
      updated[idx] = toExpand;
      return updated;
    });
  }, []);

  const handleExpandAll = () => {
    setExpandButtonState((prev) => !prev);
    setIsCardExpanded((prev) => prev.fill(expandButtonState));
  };

  useEffect(() => {
    const expandedCards = isCardExpanded.filter((state) => state).length;
    if (cardStates.length !== 0 && expandedCards === cardStates.length) {
      setExpandButtonState(false);
    } else if (expandedCards === 0) {
      setExpandButtonState(true);
    }
  }, [isCardExpanded, cardStates.length]);

  useEffect(() => {
    setResetKey((prev) => prev + 1);
  }, [newGame]);

  return (
    <div className="card-body w-full max-w-[1152px] flex flex-col item-center bg-slate-900 border border-slate-800 rounded-lg text-clamp">
      {cardStates.length === 0 ? (
        <div>
          <button
            type="button"
            className="w-full inline-flex items-center font-semibold leading-6 text-sm shadow rounded-md text-white bg-slate-700 hover:bg-slate-600 transition ease-in-out duration-150 cursor-not-allowed"
            disabled
          >
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </button>
        </div>
      ) : (
        <div className="legend flex justify-center border border-slate-800 font-medium sm:text-lg py-1 rounded-t-md">
          <div className="w-5/6 relative flex">
            <div className="w-[40px]"></div>
            <div className="w-3/12">Country</div>
            <div className="w-3/12">Region</div>
            <div className="flex-grow">GDP Per Capita ($USD)</div>
            <button
              className={`absolute left-2 top-0 border rounded-md text-clamp-shrink hover:bg-slate-950 bg-inherit transition-all text-slate-400 border-slate-600`}
              title={expandButtonState ? "Expand All" : "Collapse All"}
              onClick={handleExpandAll}
            >
              {expandButtonState ? (
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M4.707 2.293a1 1 0 00-1.414 1.414l6 6a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414L10 7.586 4.707 2.293zm0 8a1 1 0 10-1.414 1.414l6 6a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414L10 15.586l-5.293-5.293z"
                  />
                </svg>
              ) : (
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.7071 4.29289C12.5196 4.10536 12.2652 4 12 4C11.7348 4 11.4804 4.10536 11.2929 4.29289L4.29289 11.2929C3.90237 11.6834 3.90237 12.3166 4.29289 12.7071C4.68342 13.0976 5.31658 13.0976 5.70711 12.7071L12 6.41421L18.2929 12.7071C18.6834 13.0976 19.3166 13.0976 19.7071 12.7071C20.0976 12.3166 20.0976 11.6834 19.7071 11.2929L12.7071 4.29289ZM12.7071 11.2929C12.5196 11.1054 12.2652 11 12 11C11.7348 11 11.4804 11.1054 11.2929 11.2929L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L12 13.4142L18.2929 19.7071C18.6834 20.0976 19.3166 20.0976 19.7071 19.7071C20.0976 19.3166 20.0976 18.6834 19.7071 18.2929L12.7071 11.2929Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="w-1/6">Pts</div>
        </div>
      )}
      {cardStates.length !== 0 &&
        Array.isArray(cardStates) &&
        cardStates.map((item, idx) => (
          <CardView
            key={`${idx}-${resetKey}`}
            currentState={item}
            isExpanded={isCardExpanded[idx]}
            SubtractPoints={onHintReveal}
            handleGiveUp={handleGiveUp}
            expandCard={(value: boolean) => expandCard(idx, value)}
          />
        ))}
    </div>
  );
};

export default CountryCardList;
