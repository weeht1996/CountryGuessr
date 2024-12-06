export type StringMap = Record<string, string>;

export type Country = {
    name: string;
    capital: string[];
    continents: string[];
    region: string;
    subregion: string;
    languages: StringMap;
    latlng: [number, number];
    gmaps: string;
    population: number;
    flags: string;
    points: number;
    guessed: boolean;
};

export type DataCountry = {
    name: {
        common: string;
        official: string;
        nativeName: {
            [key: string]: {
            official: string;
            common: string;
            };
        };
    };
    tld: string[];
    cca2: string;
    ccn3: string;
    cca3: string;
    cioc: string;
    independent: boolean;
    status: string;
    unMember: boolean;
    currencies: CountryCurrency;
    idd: {
        root: string;
        suffixes: string[];
    };
    capital: string[];
    altSpellings: string[];
    region: string;
    subregion: string;
    languages: CountryLanguages;
    translations: CountryTranslations;
    latlng: [number, number];
    landlocked: boolean;
    area: number;
    demonyms: CountryDemonyms;
    flag: string;
    maps: CountryMaps;
    population: number;
    fifa: string;
    car: {
        signs: string[];
        side: string;
    };
    timezones: string[];
    continents: string[];
    flags: CountryFlag;
    coatOfArms: CountryCoatOfArms;
    startOfWeek: string;
    capitalInfo: {
        latlng: [number, number];
    };
    postalCode: {
        format: string;
        regex: string;
    };
};

type CountryTranslations = {
    [key: string]: {
      official: string;
      common: string;
    };
};
  
type CountryLanguages = {
    [key: string]: string;
};
  
type CountryCurrency = {
    [key: string]: {
      name: string;
      symbol: string;
    };
};
  
type CountryDemonyms = {
    [key: string]: {
      f: string;
      m: string;
    };
};
  
type CountryFlag = {
    png: string;
    svg: string;
    alt: string;
};
  
type CountryCoatOfArms = {
    png: string;
    svg: string;
};
  
type CountryMaps = {
    googleMaps: string;
    openStreetMaps: string;
};
  