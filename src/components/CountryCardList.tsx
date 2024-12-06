import React, { useEffect, useRef, useState } from "react";
import { Country } from "../types/CountryTypes";
import AnimatedNumber from "./AnimatedNumber";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { fetchCountryWikiExtract } from "../services/restCountriesClient";
import GenericModal from "./GenericModal";

type CountryHintProps = {
    country: string,
    points: number,
    hintLabel: string,
    answer: string,
    isAnswerRevealed: boolean,
    isImage?: boolean,
    onHintReveal: (country: string, num: number) => void;
};

const CountryHint = ({country, points, isAnswerRevealed, hintLabel, answer, onHintReveal, isImage = false}: CountryHintProps) => {

    const [isHintRevealed, setIsHintRevealed] = useState(false);

    const overlayClicked = () => {
        setIsHintRevealed(true);
        onHintReveal(country, points);
    };

    return (
        <div className="flex lg:mx-4 my-2 mx-2 items-center">
            <label className="mr-4 font-extrabold text-slate-400">{hintLabel}:</label>
            {   
                (isImage) ? 
                (isHintRevealed || isAnswerRevealed) ? //image
                <img className="w-3/4 max-w-[180px] max-h-[140px] mt-12 h-auto rounded-md" src={answer} alt="country-flag"/> : // revealed
                <div className="flex justify-center w-full min-w-[220px] min-h-[130px] mr-4 rounded-md bg-slate-700 hover:bg-slate-600 cursor-pointer" onClick={() => overlayClicked()}>
                    <div className="flex items-center text-clamp">Reveal 
                        <p className="text-red-500 ml-1">-{points}</p>
                    </div>
                </div> : // unrevealed

                (isHintRevealed || isAnswerRevealed) ? //not image 
                <div className="mr-4" >{answer}</div> : //revealed
                <div className="flex justify-center h-auto w-[200px] p-1 rounded-md bg-slate-700 hover:bg-slate-600 cursor-pointer" onClick={() => overlayClicked()}> 
                    <div className="flex items-center text-clamp">Reveal 
                        <p className="text-red-500 ml-1">-{points}</p>
                    </div>
                </div> //unrevealed
            }
        </div>
    )
};

type CardProps = {
    country: Country,
    isExpanded: boolean,
    expandAll: boolean,
    expandCard: (toExpand: boolean) => void,
    SubtractPoints: (country: string, hintCost: number, revealAllHints?: boolean) => void,
    handleGiveUp: () => void
};

const Card = ({country,isExpanded, expandAll, expandCard, SubtractPoints, handleGiveUp}: CardProps ) => {
    const [hasRevealedAll, setHasRevealedAll] = useState(false);
    const [hasGivenUp, setHasGivenUp] = useState(false);
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [wikiExtract, setWikiExtract] = useState('Extract not found');
    const [wikiLink, setWikiLink] = useState('Extract not found');
    const [readMore, setReadMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);

    const revealAllHints = () => {
        setHasRevealedAll(true);
        setWarningModalOpen(false);
        SubtractPoints(country.name, 0, true);
    };

    const clickedGiveUp = () => {
        handleGiveUp();
        setHasGivenUp(true);
    };

    const panToDiv = () => {
        if (!cardRef.current) return;

        const cardDiv = cardRef.current;
        expandCard(true);
        cardDiv.scrollIntoView({
            behavior: "smooth",
        })
        
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const queryName = country.name.replaceAll(' ','_');
                const wikiObj = await fetchCountryWikiExtract(queryName);
                if (wikiObj === null) return; 
                setWikiExtract(wikiObj.extract);
                setWikiLink(wikiObj.link);
            } catch (e) {
                setError((e as Error).message);
            }
        };

        fetchData();
    },[])

    useEffect(() => {
        expandCard(expandAll);
    }, [expandAll])

    useEffect(() => {
        if (!country.guessed) return;
        panToDiv();
    }, [country.guessed])

    return (
        <div className="flex flex-col rounded-md relative ">
            <div className="head flex border-y border-y-slate-700 hover:bg-slate-800 cursor-pointer" onClick={() => expandCard(!isExpanded)}>
                <div className="w-5/6 font-medium text-md text-center py-2 rounded-md max-h-[40px]">{ (country.guessed || hasGivenUp) ? country.name : '???????'}</div>
                <div className="w-1/6 py-2 border-l border-l-slate-800"><AnimatedNumber value={country.points}/></div>
                <svg className="absolute top-3 left-1" width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.70711 16.1359C5.31659 16.5264 5.31659 17.1596 5.70711 17.5501L10.5993 22.4375C11.3805 23.2179 12.6463 23.2176 13.4271 22.4369L18.3174 17.5465C18.708 17.156 18.708 16.5228 18.3174 16.1323C17.9269 15.7418 17.2937 15.7418 16.9032 16.1323L12.7176 20.3179C12.3271 20.7085 11.6939 20.7085 11.3034 20.3179L7.12132 16.1359C6.7308 15.7454 6.09763 15.7454 5.70711 16.1359Z" fill={isExpanded? '#FFFFFF4D':'#FFFFFF'}/>
                    <path d="M18.3174 7.88675C18.708 7.49623 18.708 6.86307 18.3174 6.47254L13.4252 1.58509C12.644 0.804698 11.3783 0.805008 10.5975 1.58579L5.70711 6.47615C5.31658 6.86667 5.31658 7.49984 5.70711 7.89036C6.09763 8.28089 6.7308 8.28089 7.12132 7.89036L11.307 3.70472C11.6975 3.31419 12.3307 3.31419 12.7212 3.70472L16.9032 7.88675C17.2937 8.27728 17.9269 8.27728 18.3174 7.88675Z" fill={isExpanded? '#FFFFFF':'#FFFFFF4D'}/>
                </svg>
            </div>
            {
                <div className={`body flex transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[756px]' : 'max-h-0'}`}>
                    <div className={`flex flex-wrap relative justify-between ${(country.guessed) ? 'w-5/12' : 'w-full'}`}>
                        {(!country.guessed && !hasGivenUp) && <div className="w-full mt-4 text-clamp-shrink">
                            { 
                                (hasRevealedAll) ? 
                                <button className="bg-slate-700 rounded-md w-1/3 sm:w-1/5 hover:bg-slate-600" onClick={clickedGiveUp}>
                                    <span className="text-red-500">Give Up?</span>
                                </button> :
                                <button className=" bg-slate-700 rounded-md w-1/3 sm:w-1/5 hover:bg-slate-600" onClick={() => setWarningModalOpen(true)}>
                                    <span className="text-red-500">Reveal all hints? ({country.points})</span>      
                                </button> 
                            }
                        </div>}
                        <div className="flag-hint flex justify-center my-2  h-1/5 w-auto rounded-tl-lg max-w-full">
                            <CountryHint country={country.name} points={80} isAnswerRevealed={ (country.guessed || hasRevealedAll) } hintLabel="Flag" answer={country.flags} onHintReveal={SubtractPoints} isImage={true}/>
                        </div>
                        <div className={(country.guessed) ? `mt-2 flex flex-col justify-start items-start` : 'mt-2 flex flex-col justify-start sm:items-end items-start'}>
                            <CountryHint country={country.name} points={60} isAnswerRevealed={ (country.guessed || hasRevealedAll) } hintLabel="Capital" answer={country.capital.toString()} onHintReveal={SubtractPoints}/>
                            <CountryHint country={country.name} points={10} isAnswerRevealed={ (country.guessed || hasRevealedAll) } hintLabel="Est. Population" answer={country.population.toLocaleString()} onHintReveal={SubtractPoints}/>
                        </div>
                        <div className={`location-hints w-full flex ${(country.guessed) ? 'flex-col' : 'flex-wrap'} justify-between`}>
                            <CountryHint country={country.name} points={20} isAnswerRevealed={ (country.guessed || hasRevealedAll) } hintLabel="Continent(s)" answer={country.continents.toString()} onHintReveal={SubtractPoints}/>
                            <CountryHint country={country.name} points={30} isAnswerRevealed={ (country.guessed || hasRevealedAll) } hintLabel="Region" answer={country.region} onHintReveal={SubtractPoints}/>
                            <CountryHint country={country.name} points={40} isAnswerRevealed={ (country.guessed || hasRevealedAll) } hintLabel="Subregion" answer={country.subregion} onHintReveal={SubtractPoints}/>
                        </div>
                        <div className="languages-hint flex items-center" ref={cardRef}>
                            <CountryHint country={country.name} points={20} isAnswerRevealed={ (country.guessed || hasRevealedAll) } hintLabel="Official Language(s)" answer={Object.values(country.languages).join(', ')} onHintReveal={SubtractPoints}/>
                        </div>
                    </div>
                    {(country.guessed) && <div className="info-box w-7/12 flex flex-col justify-start z-0">
                        <div className="map rounded-lg overflow-hidden m-4">
                            <MapContainer center={country.latlng} zoom={5} style={{ height: "200px", width: "100%" }}>
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
                                {
                                    (wikiExtract.length <= 350) ? 
                                    <p>{wikiExtract}</p>:
                                    <p>
                                        {wikiExtract.slice(0, 350)}
                                        {(readMore) ?
                                            <span>
                                                {wikiExtract.slice(350, wikiExtract.length)}
                                                <a href={wikiLink} className="text-blue-400" target="_blank" rel="noopener noreferrer">Wikipedia</a>
                                                <button className="ml-1 text-slate-400 font-bold" onClick={() => setReadMore(false)}>Read Less.</button>
                                            </span>
                                            :
                                            <span className="text-slate-400 font-bold"><button onClick={() => setReadMore(true)}>...read more</button></span>
                                        }
                                    </p>
                                }
                            </div>
                        
                    </div>}
                </div>
            }
            
            <GenericModal modalToggle={warningModalOpen} 
                title="Are you sure?" 
                mainBodyText="Revealing all hints removes all your points."
                subBodyText="You still have the opportunity to guess but will not receive points"
                acceptFn={revealAllHints} closeModal={setWarningModalOpen}
            />
        </div>
    )
};

type CoutryCardListProps = {
    countries: Country[],
    newGame: boolean,
    onHintReveal: (country: string, hintCost: number, revealAllHints?: boolean) => void,
    handleGiveUp: () => void
}

const CountryCardList = ({countries, newGame, onHintReveal, handleGiveUp}: CoutryCardListProps) => {

    const [isCardExpanded, setIsCardExpanded] = useState<boolean[]>([false, false, false, false, false]);
    const [allExpanded, setAllExpanded] = useState(false);
    const [expandButtonState, setExpandButtonState] = useState(true);
    const [resetKey, setResetKey] = useState(0);

    const expandCard = (idx: number, toExpand: boolean) => {
        setIsCardExpanded((prev) => {
            const updated = [...prev];
            updated[idx] = toExpand;
            return updated;
        });
    };

    const handleExpandAll = () => {
        setAllExpanded(expandButtonState);
        setExpandButtonState((prev) => !prev);
    };

    useEffect(() => {
        const expandedCards = isCardExpanded.filter((state) => state).length;
        if ((countries.length !== 0) && expandedCards === countries.length) {
            setExpandButtonState(false);
        } else if (expandedCards === 0) {
            setExpandButtonState(true);
        }
    }, [isCardExpanded]);

    useEffect(() => {
        if (!newGame) return;
        setResetKey((prev) => prev + 1);
    }, [newGame])

    return (

        <div className="card-body w-full lg:w-[1024px] flex flex-col item-center bg-slate-900 border border-slate-800 rounded-lg text-clamp">
            {
                (countries.length === 0) ?
                <div>
                    <button type="button" className="w-full inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-slate-700 hover:bg-slate-600 transition ease-in-out duration-150 cursor-not-allowed" disabled>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                    </button>
                </div> : 
                <div className="legend flex justify-center border border-slate-800 font-medium text-lg py-1 rounded-t-md">
                    <div className="w-5/6 relative">Country
                        <button className={`absolute left-2 w-24 top-0 border rounded-md text-clamp-s hover:bg-slate-950 bg-inherit transition-all text-slate-600 border-slate-600`}
                            onClick={handleExpandAll}>
                            {(expandButtonState) ? 'Expand All' : 'Collapse All'}
                        </button>
                    </div>
                    <div className="w-1/6">Pts</div>
                </div>
            }
            {(countries.length !== 0) && countries.map((item, idx) => (
                <Card
                    key={`${idx}-${resetKey}`}
                    country={item} 
                    isExpanded={isCardExpanded[idx]} 
                    SubtractPoints={onHintReveal} 
                    handleGiveUp={handleGiveUp}
                    expandCard={(value: boolean) => expandCard(idx, value)}
                    expandAll={allExpanded}
                />
                
            ))}
        </div> 
    )
};

export default CountryCardList;