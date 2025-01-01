import { useEffect, useRef } from "react";

type genericModalProps = {
    modalToggle: boolean,
    title: string,
    mainBodyText: string,
    subBodyText: string,
    acceptFn: () => void,
    closeModal: (value: boolean) => void,
};

const GenericModal = ({modalToggle, title, mainBodyText, subBodyText, acceptFn, closeModal}: genericModalProps) => {

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal(false);
            }
        };

        if (modalToggle) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

        
    }, [modalToggle, closeModal, acceptFn])
    
    if (!modalToggle) return null;

    return (
        <div className={`${(modalToggle) ? "modal-open" : 'modal-close'} w-1/3 h-auto rounded-lg bg-slate-400 border border-slate-600 z-10 text-slate-800 transition duration-300`}
        ref={modalRef}
        >
                <div className="text-lg font-bold mt-1">{title}</div>
                <span className="mt-4">{mainBodyText}</span>
                <span className="mb-4 mx-2 text-sm">*{subBodyText}</span> 
                <div className="flex justify-end gap-2 mb-2 w-4/5">
                    <button className="bg-slate-800 text-slate-400 rounded border border-slate-800 w-1/4" onClick={acceptFn}>Confirm</button>
                    <button className="bg-slate-400 rounded border border-slate-800 w-1/6" onClick={() => closeModal(false)}>No</button>
                </div>

        </div>
    )
};

export default GenericModal;