import { Attempt } from "../components/AttemptLog";
import { Country } from "./CountryTypes"

export type CardState = {
    id: number,
    country: Country,
    hintState: {
        flag: boolean,
        capital: boolean,
        population: boolean,
        subregion: boolean,
        officialLang: boolean,
    },
    points: number,
    gaveUp: boolean,
    guessed: boolean
}

export type GameState = {
    id: number,
    cardStates: CardState[],
    filteredCountries: string[],
    attempts: number,
    prevAttempts: Attempt[],
    totalCorrect: number,
    totalPoints: number,
    completed: number,
    dateCompleted: null | Date
}