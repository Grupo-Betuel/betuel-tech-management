import { useEffect } from 'react';

const useDisableScrollOnNumberInput = () => {
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
                event.preventDefault();
            }
        };

        // Add event listener to the window
        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            // Clean up the event listener
            window.removeEventListener('wheel', handleWheel);
        };
    }, []);
};

export default useDisableScrollOnNumberInput;
