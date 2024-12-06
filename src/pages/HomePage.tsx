import React, { useState, useEffect, useRef } from "react";
import Select, { StylesConfig, SingleValue } from "react-select";
import { fetchRestCountryData } from "../services/restCountriesClient";
import { Country, DataCountry } from "../types/CountryTypes";
import CountryCardList from "../components/CountryCardList";
import AttemptLog, {Attempt} from "../components/AttemptLog";
import PostGameModal from "../components/PostGameModal";
import HeaderBar from "../components/HeaderBar";

const HomePage = () => {

    const [data, setData] = useState<DataCountry[]>();
    const [filteredData, setFilteredData] = useState<Country[]>([]);
    const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
    const [userInputValue, setUserInputValue] = useState('');
    const [countryOptions, setCountryOptions] = useState<{value: string, label: string, isDisabled?: boolean}[]>([]);
    const [attempts, setAttempts] = useState(1);
    const [prevAttempts, setPreviousAttempts] = useState<Attempt[]>([]);
    const [totalCorrect, setTotalCorrect] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [borderColor, setBorderColor] = useState('1px solid black');
    const [isGameOver, setIsGameOver] = useState(false);
    const [newGame, setNewGame] = useState(false);
    const [isPostGameModalOpen, setIsPostGameModalOpen] = useState(false);
    const [selectGlowColor, setSelectGlowColor] = useState('none');
    const [completed, setCompleted] = useState(0);
    const selectRef = useRef<any>(null);
    const maxAttemptLimit = 10;

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
        let isCorrect = (filteredCountries.includes(userInputValue));
        let updatedData: Country[] = filteredData;
        setAttempts(attempts + 1);

        if (isCorrect) {
            updatedData = filteredData.map(item => item.name === userInputValue ? {...item, guessed: true} :item );
            setFilteredData(updatedData);
            setTotalPoints(totalPoints + filteredData.find((item) => item.name === userInputValue)!.points);
            setTotalCorrect((prevTotal) => prevTotal + 1);
            setCompleted((prev) => prev + 1);
            if(countryOptions.length !== 0) {
                const updatedCountryOptions = countryOptions.map(item => item.value === userInputValue ? {...item, isDisabled: true} :item );
                setCountryOptions(updatedCountryOptions);
            }
        }
        setBorderColor(isCorrect ? '3px solid green' : '3px solid red');
        setSelectGlowColor(isCorrect? '0 0 10px 5px green' : '0 0 10px 5px red')
        setTimeout(() => {
            setBorderColor('1px solid black');
            setSelectGlowColor('none');
        }, 3000);
        const newAttempt: Attempt = {
            attemptNo: attempts,
            country: userInputValue,
            result: isCorrect
        }
        setPreviousAttempts([...prevAttempts, newAttempt]);
        if (selectRef.current) selectRef.current.clearValue();
        setUserInputValue('');
    };

    const userGaveUp = () => {
        setCompleted((prev) => prev + 1);
    };

    const GameOver = () => {
        setIsGameOver(true);
        setIsPostGameModalOpen(true);
        const updatedData = filteredData.map((item) => ({
            ...item,
            guessed: true,
        }));
        setFilteredData(updatedData);
    }

    const CloseModal = () => {
        setIsPostGameModalOpen(false);
    }

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

    const SubtractPoints = (country: string, hintCost: number, revealAllHints: boolean = false) => {
        const updatedPointsFilteredData = (revealAllHints) ?
        filteredData.map(item => item.name === country ? {...item, points: 0} : item):
        filteredData.map(item => item.name === country ? {...item, points: item.points - hintCost} : item);

        setFilteredData(updatedPointsFilteredData);
    };

    const filterData = (unfilteredData: DataCountry[]) => {
        const toRemove = ['Antarctica', 'Bouvet Island', 'Macau'];
        const shuffledData = unfilteredData.slice().sort(() => 0.5 - Math.random()).slice(0, 5);
        let selectedCountries: Country[] = [];
        let selectCountryNames: string[] = [];
        shuffledData.forEach(element => {
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
                flags: element.flags.svg,
                points: 260,
                guessed: false,
            }
            selectedCountries.push(newCountry);
            selectCountryNames.push(element.name.common);
        });
        setFilteredCountries(selectCountryNames);
        setFilteredData(selectedCountries);
    };



    const startNewGame = () => {
        setNewGame(true);
        filterData(data!);
    };

    useEffect(() => {
        if(newGame) return;
        setNewGame(false);
    }, [newGame]);

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
            } catch (e) {
                console.error("Failed to parse cached data", e);
                loadData();
            }
        } else {
            loadData();
        }
        

    }, []);

    useEffect(() => {
        if (data != null ) {
            filterData(data);
            getCountryOptions();
        }
    }, [data]);
  
    useEffect(() => {
        if (completed < 5 && attempts < maxAttemptLimit) return;
        GameOver();

    }, [completed, attempts])

    return (
        <div className="flex flex-col items-center text-slate-300 text-clamp min-h-[101vh] mb-10 relative">
            <HeaderBar startNewGame={startNewGame}/>

            <div className="user-section flex gap-8 justify-between h-10 w-full lg:w-[1024px] mb-2">
                <Select
                    ref={selectRef}
                    className="w-11/12 z-20" 
                    options={countryOptions} 
                    styles={customStyles}
                    isClearable={true}
                    placeholder="Guess the country..."
                    onChange={userInputValueChange}
                    isDisabled={isGameOver}
                />
                <input type="button" className={`w-1/6 bg-slate-800 rounded-md ${!isGameOver && 'hover:cursor-pointer'}`} value="Submit" onClick={userSubmitAnswer} disabled={isGameOver}/>
            </div>
            <AttemptLog totalPoints={totalPoints} attempts={prevAttempts} attemptLimit={maxAttemptLimit}/>
            {(filterData.length !== 0) && <CountryCardList countries={filteredData} newGame={newGame} onHintReveal={SubtractPoints} handleGiveUp={userGaveUp}></CountryCardList>}
            <PostGameModal totalPoints={totalPoints} correctAnswers={totalCorrect} toggled={isPostGameModalOpen} closeModal={CloseModal}/>
        </div>
    );
}

export default HomePage;