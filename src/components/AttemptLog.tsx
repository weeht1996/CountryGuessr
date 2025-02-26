import { useEffect, useState } from "react";

export type Attempt = {
  attemptNo: number;
  country: string;
  result: boolean;
};

type AttemptLogProp = {
  attempts: Attempt[];
  attemptLimit: number;
  totalPoints: number;
};

const AttemptLog = ({
  attempts,
  attemptLimit,
  totalPoints,
}: AttemptLogProp) => {
  const [attemptsMade, setAttemptsMade] = useState(0);
  const [attemptsMap, setAttemptsMap] = useState<Attempt[]>([
    { attemptNo: 999, country: "Placeholder", result: false },
  ]);
  const [logExpanded, setLogExpanded] = useState(false);

  useEffect(() => {
    setAttemptsMade(attempts.length);
  }, [attempts]);

  useEffect(() => {
    if (attemptsMade >= 2)
      setAttemptsMap([...attempts.slice(0, attemptsMade - 1)].reverse());
  }, [attemptsMade, attempts]);

  return (
    <div className="immediate-last w-full max-w-[1152px] flex flex-col justify-center text-clamp-s text-slate-400 mb-1">
      <div className="top-bar flex w-full gap-2 mb-2">
        <div className="latest-attempt w-1/6 bg-slate-800 rounded-sm">
          Previous Attempt:{" "}
        </div>
        {attemptsMade === 0 ? (
          <div className="w-5/6 bg-slate-800 rounded-sm">No Attempts Made</div>
        ) : (
          <div className="attempt-log flex w-full bg-slate-800 rounded-sm">
            <div
              className={`w-5/6 text-slate-950 flex items-center justify-center rounded-l-sm font-semibold ${attempts[attemptsMade - 1].result ? "bg-green-400" : "bg-red-400"}`}
            >
              {attempts[attemptsMade - 1].country}
            </div>
            <div className="w-1/6 flex justify-center items-center">
              <img
                className="max-h-3 w-auto"
                src={`${process.env.PUBLIC_URL}${attempts[attemptsMade - 1].result ? "/images/check.png" : "/images/close.png"}`}
                alt="result-icon"
              />
            </div>
          </div>
        )}
      </div>
      <div className="bot-bar-main flex gap-2 flex-col sm:flex-row flex-wrap mt-1 mb-3 justify-left leading-6">
        <div className="top-wrapper flex gap-2 w-full sm:w-2/5">
          <div className="attempt-bar w-1/2 h-6 bg-slate-800 rounded-sm">
            Attempts Remaining:{" "}
            <strong>{attemptLimit - attempts.length}</strong>
          </div>
          <div className="score-bar w-1/2 h-6 bg-slate-800 rounded-sm">
            Current Score: <strong>{totalPoints}</strong>
          </div>
        </div>
        <div className="bottom-wrapper flex flex-grow">
          {
            <div
              className={`flex-grow flex flex-col relative transition-all duration-300 overflow-hidden ${logExpanded ? "max-h-[24px]" : "max-h-[500px]"}`}
            >
              {attemptsMade > 1 &&
                attemptsMap.map((attempt, idx) => (
                  <div className="log-wrapper flex leading-6" key={idx}>
                    <div className="w-1/5 bg-slate-800  text-slate-400 rounded-l-sm text-center ">
                      Attempt#{attempt.attemptNo + 1}
                    </div>
                    <div
                      className={`w-4/5 text-slate-950 rounded-r-sm text-center font-semibold ${attempt.result ? "bg-green-400" : "bg-red-400"}`}
                    >
                      {attempt.country}
                    </div>
                  </div>
                ))}
            </div>
          }
          {attemptsMade > 2 && (
            <div
              className="flex w-[14.2%] max-h-6 justify-center items-center gap-2 bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer rounded-sm last:rounded-b-sm"
              onClick={() => setLogExpanded(!logExpanded)}
            >
              <svg
                className={`hidden [@media(min-width:800px)]:block text-inherit transition ease-in-out ${!logExpanded && "rotate-180"}`}
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M8 11L12 15M12 15L16 11M12 15V3M7 4.51555C4.58803 6.13007 3 8.87958 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 8.87958 19.412 6.13007 17 4.51555"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />{" "}
                </g>
              </svg>
              {logExpanded ? "Expand" : "Collapse"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttemptLog;
