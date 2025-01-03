import React, { useState, useEffect, useRef, useCallback } from "react";
import Select, { StylesConfig, SingleValue } from "react-select";
import { fetchRestCountryData } from "../services/restCountriesClient";
import { Country, DataCountry } from "../types/CountryTypes";
import CountryCardList from "../components/CountryCardList";
import AttemptLog from "../components/AttemptLog";
import PostGameModal from "../components/PostGameModal";
import HeaderBar from "../components/HeaderBar";
import GenericModal from "../components/GenericModal";
import { CardState, GameState } from "../types/GameRecord";

const HomePage = () => {

    const defaultGameState = {
        id: 0,
        cardStates: [],
        filteredCountries: [],
        attempts: 0,
        prevAttempts: [],
        totalCorrect: 0,
        totalPoints: 0,
        completed: 0,
        dateCompleted: null
    }

    const [data, setData] = useState<DataCountry[]>();
    const [userInputValue, setUserInputValue] = useState('');
    const [countryOptions, setCountryOptions] = useState<{value: string, label: string, isDisabled?: boolean}[]>([]);
    const [borderColor, setBorderColor] = useState('1px solid black');
    const [isGameOver, setIsGameOver] = useState(false);
    const [newGame, setNewGame] = useState(false);
    const [isPostGameModalOpen, setIsPostGameModalOpen] = useState(false);
    const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
    const [selectGlowColor, setSelectGlowColor] = useState('none');
    const [resetKey, setResetKey] = useState(0);
    const [guideModalToggle, setGuideModalToggle] = useState(false);
    const [gameState, setGameState] = useState<GameState>(() => {
        const existingGameState = localStorage.getItem("GameStates");
        setGuideModalToggle(!Boolean(existingGameState));
        return existingGameState ? JSON.parse(existingGameState) : defaultGameState;
    });
    const [allGames, setAllGames] = useState<GameState[]>(() => {
        const allRecords = localStorage.getItem("AllRecords");
        setGuideModalToggle(!Boolean(allRecords));
        return allRecords ? JSON.parse(allRecords) : [];
    });
    const selectRef = useRef<any>(null);
    const maxAttemptLimit = 15;
    const maxPoints = 200;

    const customStyles: StylesConfig<any, false> = {
        option: (provided, state) => ({
          ...provided,
          color: state.isDisabled ? 'grey' : 'black',
        }),
        control: (base) => ({
            ...base,
            border: borderColor,
            boxShadow: selectGlowColor,
        }),
      };

    const userInputValueChange = (option: SingleValue<{label: string, value: string}>) => {
        if (option) setUserInputValue(option.value);
    };

    const userSubmitAnswer = () => {
        if (userInputValue === '') return;

        const isCorrect = gameState.filteredCountries.includes(userInputValue);

        const updatedCardStates: CardState[] = gameState.cardStates.map(item => item.country.name === userInputValue ? {...item, guessed: true} : item);
        const currentAttempt =  {
            attemptNo: gameState.attempts,
            country: userInputValue,
            result: isCorrect
        };

        setGameState((prev) => ({
            ...prev,
            cardStates: updatedCardStates,
            attempts: prev.attempts + 1,
            prevAttempts: [...prev.prevAttempts, currentAttempt],
            totalPoints: prev.totalPoints + (gameState.cardStates.find((item) => item.country.name === userInputValue)?.points ?? 0),
            totalCorrect: (prev.totalCorrect + ((isCorrect) ? 1 : 0)) ,
            completed: (prev.completed + ((isCorrect) ? 1 : 0)),
        }))

        if(countryOptions.length !== 0 && isCorrect) {
            const updatedCountryOptions = countryOptions.map(item => item.value === userInputValue ? {...item, isDisabled: true} :item );
            setCountryOptions(updatedCountryOptions);
        }

        setBorderColor(isCorrect ? '3px solid green' : '3px solid red');
        setSelectGlowColor(isCorrect? '0 0 10px 5px green' : '0 0 10px 5px red')
        setTimeout(() => {
            setBorderColor('1px solid black');
            setSelectGlowColor('none');
        }, 2500);
        if (selectRef.current) selectRef.current.clearValue();
        setUserInputValue('');
    };

    const userGaveUp = (countryName: string) => {
        setGameState((prev) => ({
            ...prev,
            completed: prev.completed + 1,
            cardStates: prev.cardStates.map((item) => item.country.name === countryName ? {...item, gaveUp: true} : item)
        }));
    };

    const CloseModal = useCallback(() => setIsPostGameModalOpen(false), []);
    const CloseGuideModal = useCallback(() => setGuideModalToggle(false), []);

    const SubtractPoints = (country: string, hintCost: number, hintName: string, revealAllHints: boolean = false) => {
        const updatedPointsFilteredData = (revealAllHints) ?
        gameState.cardStates.map(item => item.country.name === country ? {...item, points: 0, hintState: {
            ...item.hintState,
            flag: true,
            capital: true,
            population: true,
            subregion: true,
            officialLang: true,
        }} : item):
        gameState.cardStates.map(item => item.country.name === country ? {...item, points: item.points - hintCost, hintState: {
            ...item.hintState,
            [hintName]: true,
        }} : item);
        setGameState((prev) => ({
            ...prev,
            cardStates: updatedPointsFilteredData
        }));
    };

    const filterData = (unfilteredData: DataCountry[]) => {
        const toRemove = ['Antarctica', 'Bouvet Island', 'Macau'];
        const shuffledData = unfilteredData.slice().sort(() => 0.5 - Math.random()).slice(0, 5);
        let newCardState: CardState[] = [];
        let selectCountryNames: string[] = [];
        shuffledData.forEach((element, id) => {
            if (toRemove.includes(element.name.common)) return;
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
            }
            newCardState.push({
                id: id,
                country: newCountry,
                hintState: {
                    flag: false,
                    capital: false,
                    population: false,
                    subregion: false,
                    officialLang: false,
                },
                points: maxPoints,
                gaveUp: false,
                guessed: false,
            });
            selectCountryNames.push(element.name.common);
        });
        setGameState((prev) => ({
            ...prev,
            filteredCountries: selectCountryNames,
            cardStates: newCardState
        }));
    };

    const handleNewGame = () => {
        if (isGameOver) {
            startNewGame();
        } else {
            setIsNewGameModalOpen(true);
        }
    };

    const startNewGame = () => {
        setGameState((prev) => ({
            ...prev,
            id: prev.id + 1,
            filteredCountries: [],
            attempts: 0,
            prevAttempts: [],
            totalCorrect: 0,
            totalPoints: 0,
            completed: 0,
            dateCompleted: null
        }));

        const updatedCountryOptions = countryOptions.map(item => ({...item, isDisabled: false}) );
        
        setCountryOptions(updatedCountryOptions);
        setNewGame(true);
        setIsGameOver(false);
        setIsNewGameModalOpen(false);
        filterData(data!);
        setResetKey((prev) => prev + 1);
    };

    useEffect(() => {

        const loadData = async () => {
            try {
              const result = await fetchRestCountryData(); 
              setData(result);
              localStorage.setItem("countryRestApiData", JSON.stringify(result));
            } catch (error: any) {
              console.error(error);
            }
        };

        const cachedData = localStorage.getItem("countryRestApiData");
        if (cachedData) {
            try {
                setData(JSON.parse(cachedData));
                console.log('Cached Rest API call ran');
            } catch (e) {
                console.error("Failed to parse cached data", e);
                loadData();
            }
        } else {
            loadData();
        }
        
    }, []);

    useEffect(() => {
        if(!newGame) return;
        setNewGame(false);
    }, [newGame]);

    useEffect(() => {
        if (!data) return;

        const getCountryOptions = () => {
            let allCountries: {value: string, label: string, isDisabled?: boolean}[] = [];
            data!.forEach(element => {
                allCountries.push(
                    {
                        label: element.name.common,
                        value: element.name.common
                    }
                );
            });
            setCountryOptions(allCountries);
        };

        if (gameState.cardStates.length === 0) {
            filterData(data);
        }

        getCountryOptions();

    }, [data, gameState.cardStates.length]);
  
    useEffect(() => {
        if (gameState.completed < 5 && gameState.attempts < maxAttemptLimit) return;

        setIsGameOver(true);
        setIsPostGameModalOpen(true);
        setGameState((prev) => ({
            ...prev,
            cardStates: prev.cardStates.map((item) => item.guessed ? item: {...item, gaveUp: true}),
            dateCompleted: new Date()
        }));

    }, [gameState.completed, gameState.attempts])

    useEffect(() => {
        if (gameState.dateCompleted && (gameState.id !== allGames[allGames.length - 1].id)) {
            const updatedAllGames = [...allGames, gameState];
            setAllGames(updatedAllGames);
            localStorage.setItem("AllRecords", JSON.stringify(updatedAllGames));
        } else {
            localStorage.setItem("GameStates", JSON.stringify(gameState));
        }
    }, [gameState, allGames])

    return (
        <div className="flex flex-col items-center text-slate-300 text-clamp min-h-[101vh] mb-10 relative">
            <HeaderBar startNewGame={handleNewGame} allRecords={allGames} guideModalToggle={guideModalToggle} setGuideModal={CloseGuideModal}/>

            <div className="user-section flex gap-8 justify-between h-10 w-full lg:w-[1152px] mb-2">
                <Select
                    ref={selectRef}
                    className="w-11/12" 
                    options={countryOptions} 
                    styles={customStyles}
                    isClearable={true}
                    placeholder="Guess the country..."
                    onChange={userInputValueChange}
                    isDisabled={isGameOver}
                />
                <input type="button" className={`w-1/6 bg-slate-800 rounded-md ${!isGameOver && 'hover:cursor-pointer'}`} value="Submit" onClick={userSubmitAnswer} disabled={isGameOver}/>
            </div>
            <AttemptLog key={resetKey} totalPoints={gameState.totalPoints} attempts={gameState.prevAttempts} attemptLimit={maxAttemptLimit}/>
            {(filterData.length !== 0) && <CountryCardList cardStates={gameState.cardStates} newGame={newGame} onHintReveal={SubtractPoints} handleGiveUp={userGaveUp}></CountryCardList>}
            <PostGameModal totalPoints={gameState.totalPoints} correctAnswers={gameState.totalCorrect} toggled={isPostGameModalOpen} closeModal={CloseModal}/>
            <GenericModal 
                modalToggle={isNewGameModalOpen}
                title="Start new game?"
                mainBodyText="You currently have an uncompleted/guessed country. Resetting the game will mark the game as completed."
                subBodyText="any unguessed countries will be marked as given up"
                acceptFn={startNewGame}
                closeModal={setIsNewGameModalOpen}
            />
        </div>
    );
}

export default HomePage;