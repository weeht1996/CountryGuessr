import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { DataCountry, Country } from "../types/CountryTypes";
import { GDPChartDataPoint } from "../types/GDPData";
import {
  fetchRestCountryData,
  fetchCountryWBIndicatorGDPPerCap,
} from "../services/restCountriesClient";
import TrendChart from "../components/TrendChart";
import { CardState } from "../types/GameRecord";

type PracticeQuestionProps = {
  label: string;
  answer: string | string[];
  interactiveMode: boolean;
  revealAnswer: boolean;
  updateQns: () => void;
};

const PracticeQuestion = ({
  label,
  answer,
  interactiveMode,
  revealAnswer,
  updateQns,
}: PracticeQuestionProps) => {
  const stdAnswer = useRef<string[]>(Array.isArray(answer) ? answer : [answer]);
  const lowerCaseAnswers = new Set(
    stdAnswer.current.map((ans) => ans.toLowerCase().replace(/[\s-'.]+/g, '')),
  );

  const verifyInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userAnswer = event.target.value.toLowerCase().replace(/[\s-'.]+/g, '');
    if (lowerCaseAnswers.has(userAnswer)) updateQns();
  };

  return (
    <div className="flex gap-2 items-center">
      <label className="font-semibold">
        {label}:<span className="mr-2"></span>
        {interactiveMode && !revealAnswer ? (
          <div className="inline">
            <input
              className="rounded bg-slate-400 text-slate-800 w-40 h-4 indent-1 my-1"
              type="text"
              onChange={(e) => verifyInput(e)}
            />
          </div>
        ) : (
          <div className="inline font-normal">
            {stdAnswer.current.join(", ")}
          </div>
        )}
        {revealAnswer && interactiveMode && (
          <img
            className="max-h-3 w-auto inline ml-2"
            src={`${process.env.PUBLIC_URL}/images/check.png `}
            alt="result-icon"
          />
        )}
      </label>
    </div>
  );
};

type PracticeCardProps = {
  cardState: CardState;
  interactiveMode: boolean;
  updateCardStatus: (complete: boolean) => void;
};

const PracticeCard = ({
  cardState,
  interactiveMode,
  updateCardStatus,
}: PracticeCardProps) => {
  const [dataSetGDP, setDatasetGDP] = useState<GDPChartDataPoint[]>([
    { year: "N/A", value: 0 },
  ]);
  const [hintReveal, setHintReveal] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const country = cardState.country;
  const cardCompletion = useRef(false);
  const [practiceQns, setPracticeQns] = useState([
    { qId: 0, label: "Region", answer: country.region, complete: false },
    { qId: 1, label: "Subregion", answer: country.subregion, complete: false },
    { qId: 2, label: "Capital", answer: country.capital, complete: false },
    {
      qId: 3,
      label: "Official Language(s)",
      answer: Object.values(country.languages),
      complete: false,
    },
  ]);

  const updateQnStatus = (qnsId: number) => {
    setPracticeQns((prev) =>
      prev.map((qns) => (qns.qId === qnsId ? { ...qns, complete: true } : qns)),
    );
  };

  const handleMouseDown = () => {
    setHintReveal(true);
  };

  const handleMouseLeave = () => {
    setHintReveal(false);
  };
  const handleMouseUp = () => {
    setHintReveal(false);
  };

  const handleTouchStart = () => {
    setHintReveal(true);
  };

  const handleTouchEnd = () => {
    setHintReveal(false);
  };

  const resetQns = () => {
    setPracticeQns((prev) =>
      prev.map((qns) => ({
        ...qns,
        complete: false,
      })),
    );
  };

  const resetCard = () => {
    if (!cardCompletion.current) return;
    resetQns();
    updateCardStatus(false);
    cardCompletion.current = false;
  };

  useEffect(() => {
    if (practiceQns.every((qns) => qns.complete)) {
      cardCompletion.current = true;
      updateCardStatus(true);
    }
  }, [practiceQns, updateCardStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const countryGDP = await fetchCountryWBIndicatorGDPPerCap(country.cca2);

        if (countryGDP.length === 0) return;

        setDatasetGDP(countryGDP);

        const cachedGDPData = localStorage.getItem("GDP_API_DATA");
        const GDPData = cachedGDPData ? JSON.parse(cachedGDPData) : {};

        GDPData[country.cca2] = countryGDP;
        localStorage.setItem("GDP_API_DATA", JSON.stringify(GDPData));
      } catch (e) {
        console.error("Error fetching GDP data:", e);
      }
    };

    const cachedGDPData = localStorage.getItem("GDP_API_DATA");

    if (cachedGDPData) {
      const GDPData = JSON.parse(cachedGDPData);

      if (GDPData[country.cca2]) {
        setDatasetGDP(GDPData[country.cca2]);
      } else {
        fetchData();
      }
    } else {
      fetchData();
    }
  }, [country.cca2]);

  return (
    <div className="card-container bg-slate-800 text-slate-300 rounded-md">
      <div className="rounded-md relative items-center">
        <div className="title-body flex">
          <div className="m-4 flex flex-col justify-center">
            <div className="title-bar text-clamp-l font-semibold">
              {country.name}
            </div>
            <img
              className="h-24 w-auto"
              src={country.flags}
              alt="country flag"
            />
          </div>
          <div className="flex flex-col items-start mx-4 text-clamp justify-center text-left">
            <div className="flex justify-start mt-2">
              <label className="font-semibold mr-1">GDP Per Cap:</label>
              {dataSetGDP[0].year},{" "}
              {(Math.round(dataSetGDP[0].value * 100) / 100).toLocaleString()}{" "}
              {dataSetGDP && dataSetGDP.length > 0 && (
                <TrendChart data={dataSetGDP} />
              )}
            </div>
            {practiceQns.map((qns, id) => (
              <div key={id}>
                <PracticeQuestion
                  label={qns.label}
                  answer={qns.answer}
                  revealAnswer={qns.complete}
                  interactiveMode={interactiveMode && !hintReveal}
                  updateQns={() => updateQnStatus(id)}
                />
              </div>
            ))}
            <div className="mb-2">
              <label className="font-semibold">Population: </label>
              {country.population.toLocaleString()}
            </div>
          </div>
        </div>
        <div
          className="absolute top-1 right-1 flex flex-col justify-center items-center gap-1 text-slate-400 rounded-lg bg-slate-500 bg-opacity-0 hover:bg-opacity-20"
          onMouseEnter={() => setMenuExpanded(true)}
          onMouseLeave={() => setMenuExpanded(false)}
          onTouchStart={() => setMenuExpanded((prev) => !prev)}
        >
          <svg
            width="25px"
            height="25px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4C3.44772 13 3 12.5523 3 12ZM3 18C3 17.4477 3.44772 17 4 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18Z"
              fill="currentColor"
            />
          </svg>

          <div
            className={`body flex flex-col gap-1 transition-all duration-500 ease-in-out overflow-hidden ${menuExpanded ? "max-h-[60px]" : "max-h-0"}`}
          >
            <button onClick={resetCard} title="reset card">
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 3V8M21 8H16M21 8L18 5.29168C16.4077 3.86656 14.3051 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.2832 21 19.8675 18.008 20.777 14"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {hintReveal ? (
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M3.415 10.242c-.067-.086-.13-.167-.186-.242a16.806 16.806 0 011.803-2.025C6.429 6.648 8.187 5.5 10 5.5c1.813 0 3.57 1.148 4.968 2.475A16.816 16.816 0 0116.771 10a16.9 16.9 0 01-1.803 2.025C13.57 13.352 11.813 14.5 10 14.5c-1.813 0-3.57-1.148-4.968-2.475a16.799 16.799 0 01-1.617-1.783zm15.423-.788L18 10l.838.546-.002.003-.003.004-.01.016-.037.054a17.123 17.123 0 01-.628.854 18.805 18.805 0 01-1.812 1.998C14.848 14.898 12.606 16.5 10 16.5s-4.848-1.602-6.346-3.025a18.806 18.806 0 01-2.44-2.852 6.01 6.01 0 01-.037-.054l-.01-.016-.003-.004-.001-.002c0-.001-.001-.001.837-.547l-.838-.546.002-.003.003-.004.01-.016a6.84 6.84 0 01.17-.245 18.804 18.804 0 012.308-2.66C5.151 5.1 7.394 3.499 10 3.499s4.848 1.602 6.346 3.025a18.803 18.803 0 012.44 2.852l.037.054.01.016.003.004.001.002zM18 10l.838-.546.355.546-.355.546L18 10zM1.162 9.454L2 10l-.838.546L.807 10l.355-.546zM9 10a1 1 0 112 0 1 1 0 01-2 0zm1-3a3 3 0 100 6 3 3 0 000-6z"
                  />
                </svg>
              ) : (
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.68936 6.70456C2.52619 6.32384 2.08528 6.14747 1.70456 6.31064C1.32384 6.47381 1.14747 6.91472 1.31064 7.29544L2.68936 6.70456ZM15.5872 13.3287L15.3125 12.6308L15.5872 13.3287ZM9.04145 13.7377C9.26736 13.3906 9.16904 12.926 8.82185 12.7001C8.47466 12.4742 8.01008 12.5725 7.78417 12.9197L9.04145 13.7377ZM6.37136 15.091C6.14545 15.4381 6.24377 15.9027 6.59096 16.1286C6.93815 16.3545 7.40273 16.2562 7.62864 15.909L6.37136 15.091ZM22.6894 7.29544C22.8525 6.91472 22.6762 6.47381 22.2954 6.31064C21.9147 6.14747 21.4738 6.32384 21.3106 6.70456L22.6894 7.29544ZM19 11.1288L18.4867 10.582V10.582L19 11.1288ZM19.9697 13.1592C20.2626 13.4521 20.7374 13.4521 21.0303 13.1592C21.3232 12.8663 21.3232 12.3914 21.0303 12.0985L19.9697 13.1592ZM11.25 16.5C11.25 16.9142 11.5858 17.25 12 17.25C12.4142 17.25 12.75 16.9142 12.75 16.5H11.25ZM16.3714 15.909C16.5973 16.2562 17.0619 16.3545 17.409 16.1286C17.7562 15.9027 17.8545 15.4381 17.6286 15.091L16.3714 15.909ZM5.53033 11.6592C5.82322 11.3663 5.82322 10.8914 5.53033 10.5985C5.23744 10.3056 4.76256 10.3056 4.46967 10.5985L5.53033 11.6592ZM2.96967 12.0985C2.67678 12.3914 2.67678 12.8663 2.96967 13.1592C3.26256 13.4521 3.73744 13.4521 4.03033 13.1592L2.96967 12.0985ZM12 13.25C8.77611 13.25 6.46133 11.6446 4.9246 9.98966C4.15645 9.16243 3.59325 8.33284 3.22259 7.71014C3.03769 7.3995 2.90187 7.14232 2.8134 6.96537C2.76919 6.87696 2.73689 6.80875 2.71627 6.76411C2.70597 6.7418 2.69859 6.7254 2.69411 6.71533C2.69187 6.7103 2.69036 6.70684 2.68957 6.70503C2.68917 6.70413 2.68896 6.70363 2.68892 6.70355C2.68891 6.70351 2.68893 6.70357 2.68901 6.70374C2.68904 6.70382 2.68913 6.70403 2.68915 6.70407C2.68925 6.7043 2.68936 6.70456 2 7C1.31064 7.29544 1.31077 7.29575 1.31092 7.29609C1.31098 7.29624 1.31114 7.2966 1.31127 7.2969C1.31152 7.29749 1.31183 7.2982 1.31218 7.299C1.31287 7.30062 1.31376 7.30266 1.31483 7.30512C1.31698 7.31003 1.31988 7.31662 1.32353 7.32483C1.33083 7.34125 1.34115 7.36415 1.35453 7.39311C1.38127 7.45102 1.42026 7.5332 1.47176 7.63619C1.57469 7.84206 1.72794 8.13175 1.93366 8.47736C2.34425 9.16716 2.96855 10.0876 3.8254 11.0103C5.53867 12.8554 8.22389 14.75 12 14.75V13.25ZM15.3125 12.6308C14.3421 13.0128 13.2417 13.25 12 13.25V14.75C13.4382 14.75 14.7246 14.4742 15.8619 14.0266L15.3125 12.6308ZM7.78417 12.9197L6.37136 15.091L7.62864 15.909L9.04145 13.7377L7.78417 12.9197ZM22 7C21.3106 6.70456 21.3107 6.70441 21.3108 6.70427C21.3108 6.70423 21.3108 6.7041 21.3109 6.70402C21.3109 6.70388 21.311 6.70376 21.311 6.70368C21.3111 6.70352 21.3111 6.70349 21.3111 6.7036C21.311 6.7038 21.3107 6.70452 21.3101 6.70576C21.309 6.70823 21.307 6.71275 21.3041 6.71924C21.2983 6.73223 21.2889 6.75309 21.2758 6.78125C21.2495 6.83757 21.2086 6.92295 21.1526 7.03267C21.0406 7.25227 20.869 7.56831 20.6354 7.9432C20.1669 8.69516 19.4563 9.67197 18.4867 10.582L19.5133 11.6757C20.6023 10.6535 21.3917 9.56587 21.9085 8.73646C22.1676 8.32068 22.36 7.9668 22.4889 7.71415C22.5533 7.58775 22.602 7.48643 22.6353 7.41507C22.6519 7.37939 22.6647 7.35118 22.6737 7.33104C22.6782 7.32097 22.6818 7.31292 22.6844 7.30696C22.6857 7.30398 22.6867 7.30153 22.6876 7.2996C22.688 7.29864 22.6883 7.29781 22.6886 7.29712C22.6888 7.29677 22.6889 7.29646 22.689 7.29618C22.6891 7.29604 22.6892 7.29585 22.6892 7.29578C22.6893 7.29561 22.6894 7.29544 22 7ZM18.4867 10.582C17.6277 11.3882 16.5739 12.1343 15.3125 12.6308L15.8619 14.0266C17.3355 13.4466 18.5466 12.583 19.5133 11.6757L18.4867 10.582ZM18.4697 11.6592L19.9697 13.1592L21.0303 12.0985L19.5303 10.5985L18.4697 11.6592ZM11.25 14V16.5H12.75V14H11.25ZM14.9586 13.7377L16.3714 15.909L17.6286 15.091L16.2158 12.9197L14.9586 13.7377ZM4.46967 10.5985L2.96967 12.0985L4.03033 13.1592L5.53033 11.6592L4.46967 10.5985Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PracticePage = () => {
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const [indexWindow, setIndexWindow] = useState(0);
  const [filterVals, setFilterVals] = useState({
    region: "All",
    subregion: "All",
  });
  const [filteredCards, setFilteredCards] = useState<CardState[]>([]);
  const [currentDone, setTotalDone] = useState(0);
  const [resetCardKey, setResetCardKey] = useState(0);
  const data = useRef<DataCountry[]>();
  const cardsPerView = 6;

  const allRegionSelectKVs = useMemo(() => {
    const allFilters: Record<string, string[]> = { All: ["All"] };

    cardStates.forEach((card) => {
      const region = card.country.region;
      const subregion = card.country.subregion;

      if (!allFilters[region]) {
        allFilters[region] = ["All"];
      }

      if (!allFilters[region].includes(subregion)) {
        allFilters[region].push(subregion);
      }

      if (!allFilters.All.includes(subregion)) {
        allFilters.All.push(subregion);
      }
    });
    return allFilters;
  }, [cardStates]);

  useEffect(() => {
    let filtered = cardStates;
    if (filterVals.subregion !== "All") {
      filtered = filtered.filter(
        (item) => item.country.subregion === filterVals.subregion,
      );
    } else if (filterVals.region !== "All") {
      filtered = filtered.filter(
        (item) => item.country.region === filterVals.region,
      );
    }
    setFilteredCards(filtered);
    setIndexWindow(0);
  }, [cardStates, filterVals]);

  const totalCards = filteredCards.length;
  const totalPages = Math.ceil(filteredCards.length / cardsPerView);

  const currentView = filteredCards.slice(
    indexWindow * cardsPerView,
    indexWindow * cardsPerView + cardsPerView >= filteredCards.length
      ? filteredCards.length
      : indexWindow * cardsPerView + cardsPerView,
  );

  const shuffleArray = (arr: CardState[]): CardState[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = () => {
    setFilteredCards((prev) => shuffleArray(prev));
  };

  const handlePagination = (nextPage: boolean) => {
    setIndexWindow((prev) => {
      if (nextPage) {
        return prev < totalPages - 1 ? prev + 1 : prev;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  };

  const resetAllCardStates = () => {
    setTotalDone(0);
    setResetCardKey((prev) => prev + 1);
  };

  const updateCardStatus = useCallback((complete: boolean) => {
    setTotalDone((prev) => (complete ? prev + 1 : prev - 1));
  }, []);

  const filterCountries = useCallback((countryData: DataCountry[]) => {
    let newCardState: CardState[] = [];
    let cardId = 0;
    countryData.forEach((element) => {
      const newCountry: Country = {
        name: element.name.common,
        capital: element.capital,
        continents: element.continents,
        region: element.region,
        subregion: element.subregion,
        languages: element.languages,
        latlng: element.latlng,
        gmaps: element.maps.googleMaps,
        population: element.population,
        cca2: element.cca2,
        gini: element.gini,
        flags: element.flags.svg,
      };
      newCardState.push({
        id: cardId,
        country: newCountry,
        hintState: {
          flag: false,
          capital: false,
          population: false,
          subregion: false,
          officialLang: false,
        },
        points: 0,
        gaveUp: false,
        guessed: false,
      });
      cardId += 1;
    });
    setCardStates(newCardState);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchRestCountryData();
        data.current = result;
        localStorage.setItem("countryRestApiData", JSON.stringify(result));
        filterCountries(result);
      } catch (error: any) {
        console.error(error);
      }
    };

    const cachedData = localStorage.getItem("countryRestApiData");
    if (cachedData) {
      try {
        data.current = JSON.parse(cachedData);
        filterCountries(JSON.parse(cachedData));
      } catch (e) {
        console.error("Failed to parse cached data", e);
        loadData();
      }
    } else {
      loadData();
    }
  }, [filterCountries]);

  return (
    <div className="practice-container flex justify-center">
      <div className="practice-body w-full lg:w-[1152px] flex flex-col gap-2 items-center justify-center">
        <div className="flex w-full my-4">
          <button
            className={`w-1/2 rounded ${interactiveMode ? "bg-slate-600" : "bg-slate-300"} `}
            onClick={() => setInteractiveMode(false)}
          >
            Plain
          </button>
          <button
            className={`w-1/2 rounded ${!interactiveMode ? "bg-slate-600" : "bg-slate-300"} `}
            onClick={() => setInteractiveMode(true)}
          >
            Interactive
          </button>
        </div>
        <div className="flex flex-col items-center w-full text-slate-300">
          <div className="top-bar flex justify-between bg-slate-700 rounded-md w-full">
            <div className="filters-container flex items-center mx-2 gap-2">
              <span>Filter by </span>
              <label htmlFor="region-select">
                <span className="mx-1">Region</span>
                <select
                  className="text-slate-600 bg-slate-400 rounded-sm"
                  id="region-select"
                  onChange={(event) => {
                    setFilterVals({
                      region: event.target.value,
                      subregion: "All",
                    });
                  }}
                >
                  {Object.keys(allRegionSelectKVs).map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="subregion-select">
                <span className="mx-1">Subregion</span>
                <select
                  className="text-slate-600 bg-slate-400 rounded-sm"
                  id="subregion-select"
                  onChange={(event) => {
                    setFilterVals((prev) => ({
                      ...prev,
                      subregion: event.target.value,
                    }));
                  }}
                >
                  {allRegionSelectKVs[filterVals.region].map((subregion) => (
                    <option key={subregion} value={subregion}>
                      {subregion}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="right-bar flex items-center text-clamp gap-1 my-1">
              <span className="mr-2">
                Completed {currentDone}/{totalCards}
              </span>
              <button className="mr-1" onClick={handleShuffle} title="shuffle">
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 4L21 7M21 7L18 10M21 7H17C16.0707 7 15.606 7 15.2196 7.07686C13.6329 7.39249 12.3925 8.63288 12.0769 10.2196C12 10.606 12 11.0707 12 12C12 12.9293 12 13.394 11.9231 13.7804C11.6075 15.3671 10.3671 16.6075 8.78036 16.9231C8.39397 17 7.92931 17 7 17H3M18 20L21 17M21 17L18 14M21 17H17C16.0707 17 15.606 17 15.2196 16.9231C15.1457 16.9084 15.0724 16.8917 15 16.873M3 7H7C7.92931 7 8.39397 7 8.78036 7.07686C8.85435 7.09158 8.92758 7.1083 9 7.12698"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className="mr-2"
                onClick={resetAllCardStates}
                title="reset all cards"
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 3V8M21 8H16M21 8L18 5.29168C16.4077 3.86656 14.3051 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.2832 21 19.8675 18.008 20.777 14"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="practice-body w-full">
            <div
              key={resetCardKey}
              className="practice-card-container grid grid-cols-1 md:grid-cols-2 gap-4 my-4"
            >
              {currentView.map((cardState) => (
                <PracticeCard
                  key={cardState.id}
                  cardState={cardState}
                  interactiveMode={interactiveMode}
                  updateCardStatus={updateCardStatus}
                />
              ))}
            </div>
          </div>
          <div className="bot-bar flex justify-center w-full gap-2 bg-slate-700 rounded-md">
            <button onClick={() => handlePagination(false)}>
              <svg
                className="-rotate-90"
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
            </button>
            <span className="m-1">
              Page: {indexWindow + 1}/{totalPages}
            </span>
            <button onClick={() => handlePagination(true)}>
              <svg
                className="rotate-90"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
