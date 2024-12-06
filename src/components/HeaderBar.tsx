const HeaderBar = ({startNewGame}: {startNewGame: () => void}) => {

    return (
        <div className="flex justify-center items-center gap-2">
            <span className="h-7 w-7 border-2 hover:animate-spin border-slate-300 hover:border-slate-500 hover:text-slate-500 cursor-pointer rounded-full flex items-center justify-center mt-1 "
                onClick={startNewGame}
                title="Reset Game"
            >
                <svg width="18px" height="18px" viewBox="0 0 24 24"fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 3V8M21 8H16M21 8L18 5.29168C16.4077 3.86656 14.3051 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.2832 21 19.8675 18.008 20.777 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </span>
            <h1 className="block text-3xl font-bold my-4">Guess the Country</h1>
        </div>
    )
};

export default HeaderBar;