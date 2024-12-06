const Footer = () => {
    return (
        <div className="flex w-full items-center justify-center text-slate-400 text-clamp">
            <div className="Thanks w-1/5 flex flex-col">
                <b className="text-clamp-l">Special Thanks</b>
                <span>If it ain't obvious enough, idea, layout & designs from: <link rel="stylesheet" href="https://boxofficega.me/"/></span>
            </div>
            <div className="attributions">
                <b>Attributions: </b> <br />
                <span>https://freevectormaps.com/world-maps/WRLD-EPS-02-0007?ref=atr</span>
            </div>
        </div>

    )
};

export default Footer;