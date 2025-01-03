import { useState, useEffect, useRef, } from "react";
import { GameState } from "../types/GameRecord";
import SortComponent from "./SortComponent";

type HistoryModalProps = {
    modalToggle: boolean,
    allRecords: GameState[],
    closeModal: () => void,
};

const HistoryModal = ({modalToggle, allRecords, closeModal}: HistoryModalProps) => {
        const modalRef = useRef<HTMLDivElement>(null);
        const [historyData, setHistoryData] = useState<GameState[]>(allRecords);
        const [descending, setDescending] = useState(true);

        const convertDateStringToString = (dateString: string | Date) => {
            const newDate = new Date(dateString);

            return newDate.toLocaleDateString('en-SG', {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });
        };

        const sortData = (type: 'dateCompleted' | 'totalPoints', asc: boolean) => {
            setDescending(!asc);
            setHistoryData([...historyData].sort((a,b) => {
                const valueA = a[type]!;
                const valueB = b[type]!;
                const comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
                return asc ? comparison : -comparison; 
            }))

        };
        
        useEffect(() => {
            const clickedOutside = (event: MouseEvent) => {
                if (modalRef.current && !modalRef.current.contains(event.target as Node)) closeModal();
            };
    
            if(modalToggle) document.addEventListener('mousedown', clickedOutside);
            return () => {document.removeEventListener('mousedown', clickedOutside)};
    
        }, [modalToggle, closeModal])

    return (
        <div ref={modalRef} className={`${modalToggle ? 'history-modal-open' : 'modal-close'} w-1/2 h-auto max-h-[75%] rounded-lg bg-slate-400 border border-slate-600 z-10 text-slate-800 transition-transform duration-300`}>
            <div className="w-full flex flex-col overflow-y-auto">
                <div className="flex justify-between mt-4 ">
                    <div className="w-1/3"></div>
                    <h1 className="w-1/3 text-clamp-l font-extrabold ml-4">Past Games</h1>
                    <div className="w-1/3 pr-2">
                        <SortComponent sortData={sortData} descending={descending}/>
                    </div>

                </div>
                <div className="mb-2 overflow-y-auto">
                    { ( historyData.length > 0 ) ?
                        historyData.map((gameState) => (
                            <div className="game-record flex flex-col items-center justify-center my-4 text-left">
                                <span className="ml-3 text-left">
                                    Date completed: {convertDateStringToString(gameState.dateCompleted!)}
                                </span>
                                <table className="w-5/6  table-fixed">
                                    <thead>
                                    <tr>
                                        <th className="w-1/12 px-2 py-1">ID</th>
                                        <th className="w-5/12 px-2 py-1">Country Name</th>
                                        <th className="w-3/12 px-2 py-1">Result</th>
                                        <th className="w-3/12 px-2 py-1">Points</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {gameState.cardStates.map((card) => (
                                            <tr className="">
                                                <td>{`${gameState.id}.${card.id}`}</td>
                                                <td >{card.country.name}</td>
                                                <td>{(card.guessed) ? 'Correct' : 'Wrong'}</td>
                                                <td>{(card.guessed) ? card.points : 0}</td>
                                            </tr>
                                        ))}
                                        <tr className="font-bold">
                                            <td></td>
                                            <td></td>
                                            <td>Total Points:</td>
                                            <td>
                                                {gameState.totalPoints}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ))
                        :
                        <div>
                            <span>You currently have no existing completed games</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
};

export default HistoryModal;