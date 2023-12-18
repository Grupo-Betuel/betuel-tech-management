// DraggableGrid.tsx
import React, {useState} from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import "./DraggableGrid.scss";
import {IShippingCardLayout} from "../ShippingCard/ShippingCard";
const ResponsiveGridLayout = WidthProvider(GridLayout);
export interface DraggableGridItem { id: string; content: string | JSX.Element; x: number; y: number; w: number; h: number, layout?: IShippingCardLayout; }

interface DraggableGridProps {
    items: DraggableGridItem[];
    onLayoutChange: (layout: GridLayout.Layout[]) => void;
    increaseBy?: number;
}


const DraggableGrid: React.FC<DraggableGridProps> = ({ items, onLayoutChange, increaseBy }) => {
    const [layout, setLayout] = useState<any>(items.map((item, index) => ({ i: item.id, x: item.x, y: item.y, w: 1, h: 1, static: false })));

    const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
        const updatedItems = newLayout.map((newItemLayout) => {
            const correspondingItem = items.find((item) => item.id === newItemLayout.i);
            return { ...correspondingItem!, x: newItemLayout.x, y: newItemLayout.y };
        });

        setLayout(newLayout);
        onLayoutChange(updatedItems as any);
    };

    return (
        <ResponsiveGridLayout margin={[12 * (increaseBy || 1),0]} className="grid-layout layout"
                              layout={layout}
                              onLayoutChange={handleLayoutChange} cols={2} maxRows={3}
                              rowHeight={319.68 * (increaseBy || 1)}
                              // rowHeight={719.68}
        >
            {layout.map((item: any, index: any) => (
                <div className="grid-layout-item" key={item.i}
                     data-grid={{ x: item.x, y: item.y, w: 1, h: 1, static: false, width: 384 * (increaseBy || 1) }}>
                    {items[index].content}
                </div>
            ))}
        </ResponsiveGridLayout>
    );
};

export default DraggableGrid;
