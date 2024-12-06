export const fetchRestCountryData = async () => {
    const response = await fetch('https://restcountries.com/v3.1/independent?status=true');
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return await response.json();
};

export const fetchCountryWikiExtract = async (countryName: string) => {
  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${countryName}`);
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }
  const data = await response.json();

  return data ? 
  {
    link: data.content_urls.desktop.page,
    extract: data.extract
  } : null;
}