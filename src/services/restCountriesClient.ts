export const fetchRestCountryData = async () => {
  const response = await fetch(
    "https://restcountries.com/v3.1/independent?status=true",
  );
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }
  return await response.json();
};

export const fetchCountryWikiExtract = async (countryName: string) => {
  const response = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${countryName}`,
  );
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }
  const data = await response.json();

  return data
    ? {
        link: data.content_urls.desktop.page,
        extract: data.extract,
      }
    : null;
};

export const fetchCountryWBIndicatorGDPPerCap = async (
  countryISO: `${string}${string}`,
) => {
  const response = await fetch(
    `https://api.worldbank.org/v2/country/${countryISO}/indicator/NY.GDP.PCAP.CD?format=json`,
  );
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }
  const data = await response.json();
  const GDPDataPoints: { year: string; value: number }[] = [];

  if (data[1] && data[1].length > 0) {
    let limit = 14;
    for (let index = 0; index < data[1].length; index++) {
      if (index > limit) break;
      if (data[1][index].value === null || data[1][index].value === 0) {
        limit++;
        continue;
      }
      const element = data[1][index];
      GDPDataPoints.push({
        year: element.date,
        value: element.value,
      });
    }
  } else {
    console.error(`No data found for ${countryISO}`);
  }

  return GDPDataPoints;
};
