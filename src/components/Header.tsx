import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <div className="header-container w-full text-slate-300 flex flex-col items-center my-2">
      <h1 className="block text-4xl font-bold my-4">Guess the Country</h1>
      <div className="w-11/12 sm:w-5/12">
        <nav className="flex justify-center bg-slate-300 text-slate-900 rounded-md overflow-hidden">
          <div className="w-1/2 flex justify-center">
            <NavLink
              className={({ isActive }) =>
                `navlink ${isActive ? "w-full bg-slate-500 text-slate-300 shadow-lg" : ""}`
              }
              to="/"
            >
              {({ isActive }) => (
                <div className="flex justify-center relative">
                  {isActive && (
                    <img
                      src={`${process.env.PUBLIC_URL}/images/globe-alt-svgrepo-com.svg`}
                      className="h-4 w-4 absolute top-1 left-2"
                      alt="Challenge Indicator"
                    />
                  )}
                  Challenge
                </div>
              )}
            </NavLink>
          </div>
          <div className="w-1/2 flex relative justify-center border-l border-slate-500">
            <NavLink
              className={({ isActive }) =>
                `navlink ${isActive ? "w-full bg-slate-500 text-slate-300 shadow-lg" : ""}`
              }
              to="/practice"
            >
              {({ isActive }) => (
                <div className="flex justify-center relative">
                  {isActive && (
                    <img
                      src={`${process.env.PUBLIC_URL}/images/globe-alt-svgrepo-com.svg`}
                      className="h-4 w-4 absolute top-1 left-2"
                      alt="Practice Indicator"
                    />
                  )}
                  Practice
                </div>
              )}
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
