const Footer = () => {
    return (
        <div className="footer-container w-full flex justify-center">
            <div className="footer flex w-11/12 items-center text-slate-400 text-clamp">
                <div className="thanks w-1/2 flex flex-col items-center">
                    <b className="text-clamp-l mx-2">Special Thanks</b>
                    <span>Idea, layout & designs from: <a href="https://boxofficega.me/">Box Office Game</a></span>
                </div>
                <div className="attributions w-1/2 flex flex-col items-center">
                    <b className="text-clamp-l mx-2">Attributions:</b>
                    <span>Map by <a href="https://react-leaflet.js.org/">React Leaflet</a></span>
                    <span>Country Information by <a href="https://restcountries.com/">Rest API</a></span>
                    <span>GDP information by <a href="https://documents.worldbank.org/en/publication/documents-reports/api/">The World Bank Group</a></span>
                </div>
            </div>
        </div>

    )
};

export default Footer;