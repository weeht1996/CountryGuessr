import React, { useEffect, useMemo, useRef, useState } from "react";

import { Country } from "../types/CountryTypes";
import AnimatedNumber from "./AnimatedNumber";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  fetchCountryWBIndicatorGDPPerCap,
  fetchCountryWikiExtract,
} from "../services/restCountriesClient";
import GenericModal from "./GenericModal";
import { GDPChartDataPoint } from "../types/GDPData";
import TrendChart from "./TrendChart";
import { CardState } from "../types/GameRecord";

type CountryHintProps = {
  country: string;
  points: number;
  hintLabel: string;
  hintName: string;
  answer: string;
  isAnswerRevealed: boolean;
  isImage?: boolean;
  onHintReveal: (country: string, num: number, hintName: string) => void;
};

const CountryHint = ({
  country,
  points,
  isAnswerRevealed,
  hintLabel,
  hintName,
  answer,
  onHintReveal,
  isImage = false,
}: CountryHintProps) => {
  const [isHintRevealed, setIsHintRevealed] = useState(false);

  const overlayClicked = () => {
    setIsHintRevealed(true);
    onHintReveal(country, points, hintName);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center">
      <label className="mr-4 font-extrabold text-slate-400">{hintLabel}:</label>
      {
        isImage ? (
          isHintRevealed || isAnswerRevealed ? ( //image
            <img
              className="w-3/4 max-w-[180px] max-h-[140px] h-auto mt-2 rounded-md"
              src={answer}
              alt="country-flag"
            /> // revealed
          ) : (
            <div
              className="flex justify-center w-full min-w-[220px] min-h-[130px] rounded-md bg-slate-700 hover:bg-slate-600 cursor-pointer"
              onClick={() => overlayClicked()}
            >
              <div className="flex items-center text-clamp">
                Reveal
                <p className="text-red-500 ml-1">-{points}</p>
              </div>
            </div>
          ) // unrevealed
        ) : isHintRevealed || isAnswerRevealed ? ( //not image
          <div className="mr-4">{answer}</div> //revealed
        ) : (
          <div
            className="flex justify-center h-auto w-[200px] my-1 p-1 rounded-md bg-slate-700 hover:bg-slate-600 cursor-pointer"
            onClick={() => overlayClicked()}
          >
            <div className="flex items-center text-clamp">
              Reveal
              <p className="text-red-500 ml-1">-{points}</p>
            </div>
          </div>
        ) //unrevealed
      }
    </div>
  );
};

type CardProps = {
  currentState: CardState;
  isExpanded: boolean;
  expandCard: (toExpand: boolean) => void;
  SubtractPoints: (
    country: string,
    hintCost: number,
    hintName: string,
    revealAllHints?: boolean,
  ) => void;
  handleGiveUp: (countryName: string) => void;
};

const CardView = ({
  currentState,
  isExpanded,
  expandCard,
  SubtractPoints,
  handleGiveUp,
}: CardProps) => {
  const [hasRevealedAll, setHasRevealedAll] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [wikiExtract, setWikiExtract] = useState("Extract not found");
  const [wikiLink, setWikiLink] = useState("Extract not found");
  const [readMore, setReadMore] = useState(false);
  const [dataSetGDP, setDatasetGDP] = useState<GDPChartDataPoint[]>([
    { year: "9999", value: 0 },
  ]);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const country: Country = currentState.country;

  const revealAllHints = () => {
    setHasRevealedAll(true);
    setWarningModalOpen(false);
    SubtractPoints(country.name, 0, "all", true);
  };

  const showContent = useMemo(() => {
    return currentState.guessed || currentState.gaveUp || hasRevealedAll;
  }, [currentState.guessed, currentState.gaveUp, hasRevealedAll]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryName = country.name.replaceAll(" ", "_");
        const wikiObj = await fetchCountryWikiExtract(queryName);
        const countryGDP = await fetchCountryWBIndicatorGDPPerCap(country.cca2);
        if (wikiObj === null || countryGDP.length === 0) return;
        setWikiExtract(wikiObj.extract);
        setWikiLink(wikiObj.link);
        setDatasetGDP(countryGDP);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [country.name, country.cca2]);

  useEffect(() => {
    if (!currentState.guessed) return;

    const panToDiv = () => {
      if (!cardRef.current) return;

      const cardDiv = cardRef.current;
      expandCard(true);
      cardDiv.scrollIntoView({
        behavior: "smooth",
      });
    };
    panToDiv();
  }, [currentState.guessed, expandCard]);

  useEffect(() => {
    const allHintRevealed = Object.values(currentState.hintState).every(
      (value) => value === true,
    );
    if (allHintRevealed) setHasRevealedAll(true);
  }, [currentState.hintState]);

  return (
    <div className="flex flex-col rounded-md relative">
      <div
        className="head flex border-y border-y-slate-700 hover:bg-slate-800 cursor-pointer"
        onClick={() => expandCard(!isExpanded)}
      >
        <div className="w-5/6  font-normal text-center flex py-2 rounded-md max-h-[40px]">
          <div className="w-[40px]"></div>
          <div className="w-3/12">
            {currentState.guessed || currentState.gaveUp
              ? country.name
              : "???????"}
          </div>
          <div className="w-3/12">{country.region}</div>
          <div className="flex-grow flex justify-evenly">
            <span className="hidden sm:block">{dataSetGDP[0].year}:</span>
            <span>
              {(Math.round(dataSetGDP[0].value * 100) / 100).toLocaleString()}
            </span>
            {dataSetGDP && dataSetGDP.length > 0 && (
              <TrendChart data={dataSetGDP} />
            )}
          </div>
        </div>
        <div className="w-1/6 py-2 border-l border-l-slate-800">
          <AnimatedNumber value={currentState.points} />
        </div>
        <svg
          className="absolute top-3 left-1"
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.70711 16.1359C5.31659 16.5264 5.31659 17.1596 5.70711 17.5501L10.5993 22.4375C11.3805 23.2179 12.6463 23.2176 13.4271 22.4369L18.3174 17.5465C18.708 17.156 18.708 16.5228 18.3174 16.1323C17.9269 15.7418 17.2937 15.7418 16.9032 16.1323L12.7176 20.3179C12.3271 20.7085 11.6939 20.7085 11.3034 20.3179L7.12132 16.1359C6.7308 15.7454 6.09763 15.7454 5.70711 16.1359Z"
            fill={isExpanded ? "#FFFFFF4D" : "#FFFFFF"}
          />
          <path
            d="M18.3174 7.88675C18.708 7.49623 18.708 6.86307 18.3174 6.47254L13.4252 1.58509C12.644 0.804698 11.3783 0.805008 10.5975 1.58579L5.70711 6.47615C5.31658 6.86667 5.31658 7.49984 5.70711 7.89036C6.09763 8.28089 6.7308 8.28089 7.12132 7.89036L11.307 3.70472C11.6975 3.31419 12.3307 3.31419 12.7212 3.70472L16.9032 7.88675C17.2937 8.27728 17.9269 8.27728 18.3174 7.88675Z"
            fill={isExpanded ? "#FFFFFF" : "#FFFFFF4D"}
          />
        </svg>
      </div>
      {
        <div
          className={`body flex transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? "max-h-[756px]" : "max-h-0"}`}
        >
          <div
            className={`flex flex-wrap relative justify-evenly gap-4 items-center p-2 mb-2 ${currentState.guessed || currentState.gaveUp ? "w-5/12" : "w-full"}`}
          >
            {!currentState.guessed && !currentState.gaveUp && (
              <div className="w-full mt-4 text-clamp-shrink">
                {hasRevealedAll ? (
                  <button
                    className="bg-slate-700 rounded-md w-1/3 sm:w-1/5 hover:bg-slate-600"
                    onClick={() => handleGiveUp(currentState.country.name)}
                  >
                    <span className="text-red-500">Give Up?</span>
                  </button>
                ) : (
                  <button
                    className=" bg-slate-700 rounded-md w-1/3 sm:w-1/5 hover:bg-slate-600"
                    onClick={() => setWarningModalOpen(true)}
                  >
                    <span className="text-red-500">
                      Reveal all hints? ({currentState.points})
                    </span>
                  </button>
                )}
              </div>
            )}
            <div className="flag-hint flex justify-center my-2 h-1/4 w-auto rounded-tl-lg max-w-full">
              <CountryHint
                country={country.name}
                points={70}
                isAnswerRevealed={showContent || currentState.hintState.flag}
                hintLabel="Flag"
                answer={country.flags}
                hintName="flag"
                onHintReveal={SubtractPoints}
                isImage={true}
              />
            </div>
            <div
              className={
                currentState.guessed
                  ? `mt-2 flex flex-col justify-start sm:items-start items-center`
                  : "mt-2 flex flex-col justify-start sm:items-end items-start"
              }
            >
              <CountryHint
                country={country.name}
                points={50}
                isAnswerRevealed={showContent || currentState.hintState.capital}
                hintLabel="Capital"
                answer={country.capital.toString()}
                hintName="capital"
                onHintReveal={SubtractPoints}
              />
              <CountryHint
                country={country.name}
                points={10}
                isAnswerRevealed={
                  showContent || currentState.hintState.population
                }
                hintLabel="Est. Population"
                answer={country.population.toLocaleString()}
                hintName="population"
                onHintReveal={SubtractPoints}
              />
              <CountryHint
                country={country.name}
                points={20}
                isAnswerRevealed={
                  showContent || currentState.hintState.subregion
                }
                hintLabel="Subregion"
                answer={country.subregion}
                hintName="subregion"
                onHintReveal={SubtractPoints}
              />
              <CountryHint
                country={country.name}
                points={50}
                isAnswerRevealed={
                  showContent || currentState.hintState.officialLang
                }
                hintLabel="Official Language(s)"
                answer={Object.values(country.languages).join(", ")}
                hintName="officialLang"
                onHintReveal={SubtractPoints}
              />
            </div>
          </div>
          {(currentState.guessed || currentState.gaveUp) && (
            <div className="info-box w-7/12 flex flex-col justify-start z-0">
              <div className="map rounded-lg overflow-hidden m-4">
                <MapContainer
                  center={country.latlng}
                  zoom={5}
                  style={{ height: "200px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={country.latlng}>
                    <Popup>{country.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="extract-info m-4">
                {wikiExtract.length <= 350 ? (
                  <p>{wikiExtract}</p>
                ) : (
                  <p>
                    {wikiExtract.slice(0, 350)}
                    {readMore ? (
                      <span>
                        {wikiExtract.slice(350, wikiExtract.length)}
                        <a
                          href={wikiLink}
                          className="text-blue-400"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Wikipedia
                        </a>
                        <button
                          className="ml-1 text-slate-400 font-bold"
                          onClick={() => setReadMore(false)}
                        >
                          Read Less.
                        </button>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold">
                        <button onClick={() => setReadMore(true)}>
                          ...read more
                        </button>
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      }

      <GenericModal
        modalToggle={warningModalOpen}
        title="Are you sure?"
        mainBodyText="Revealing all hints removes all your points."
        subBodyText="You still have the opportunity to guess but will not receive points"
        acceptFn={revealAllHints}
        closeModal={setWarningModalOpen}
      />
    </div>
  );
};

export default CardView;
