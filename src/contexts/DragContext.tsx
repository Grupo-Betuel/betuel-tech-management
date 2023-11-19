import React, {createContext, useContext, useState} from 'react';

interface DragContextProps {
    draggedItem: { id: string; text: string } | null;
    setDraggedItem: React.Dispatch<React.SetStateAction<{ id: string; text: string } | null>>;
}

const DragContext = createContext<DragContextProps | undefined>(undefined);

export const DragProvider = ({children}: any) => {
    const [draggedItem, setDraggedItem] = useState<{ id: string; text: string } | null>(null);

    return (
        <DragContext.Provider value={{draggedItem, setDraggedItem}}>
            {children}
        </DragContext.Provider>
    );
};

export const useDragContext = () => {
    const context = useContext(DragContext);
    if (!context) {
        throw new Error('useDragContext must be used within a DragProvider');
    }
    return context;
};
