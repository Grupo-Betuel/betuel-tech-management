import React, {useMemo} from "react";
import "./PrintSheet.scss"
import GridLayout from 'react-grid-layout';
import DraggableGrid, {DraggableGridItem} from "../DraggableGrid/DraggableGrid";
import {Button} from "reactstrap";
import {toPng} from "html-to-image";
import {betuelDanceShippingCardLayout, EmptyGridItem} from "../FlyerDesigner/constants/shipping-card-layouts";
import {IOrder} from "../../model/ordersModels";
import {ShippingCard} from "../ShippingCard/ShippingCard";
import {passOrderToShippingLayout} from "../../utils/order.utils";


interface DraggableGridProps {
    orders: IOrder[];
}

export const PrintOrdersSheet = ({orders}: DraggableGridProps) => {
    const [increaseBy, setIncreaseBy] = React.useState<number>(1);
    const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
        // Handle layout changes here if needed
    };

    const handlePrint = async () => {
        setIncreaseBy(5);
        const printWindow = window.open('', '_blank');
        // return;
        if (printWindow) {
            // const options = { quality: 2.0, width: containerRef.current.offsetWidth };

            const content = document.getElementById('printableArea')!
            const image = document.createElement('img')
            image.width = 816;
            image.height = 1056;

            await toPng(content, {cacheBust: true, quality: 3.0, width: content.offsetWidth})
                .then(async (dataUrl: string, param2: any) => {
                    if (dataUrl) {
                        image.src = dataUrl as string;
                    }
                })

            await printWindow.document.open();
            await printWindow.document.write(`
                <html>
                  <head>
                    <title>Imprimir Orden</title>
                    <style>
                      @page {
                        /*size: 8.5inch, 11inch;*/
                        margin: 0;
                      }
        
                      body {
                        margin: 0;
                      }
                    </style>
                  </head>
                  <body>
                    ${image.outerHTML}
                    <script type="text/javascript">
                      // You can also include additional scripts if needed
                    </script>
                  </body>
                </html>
                                `);
            await printWindow.document.close();
            await printWindow.print();
        }
        setIncreaseBy(1);
    };

    const items: DraggableGridItem[] = useMemo(() => {
        return orders.map((order, i) => ({
            x: Math.floor((i / 2) + 1),
            y: Math.floor((i / 2) + 1),
            w:1,
            h:1,
            id: `${Date.now()}-${i}`,
            content:
                <ShippingCard
                    layout={passOrderToShippingLayout(order, betuelDanceShippingCardLayout)}
                />
        }))
    }, [orders]);



    const gridItems: DraggableGridItem[] = useMemo(() => {
        const max = 6;
        const left = max - orders.length;
        const extra = Array.from(new Array(left)).map((p, i) => EmptyGridItem(i));
        return [...items, ...extra]
    }, [items])

    return (
        <div className="print-sheet-wrapper">
            <Button onClick={handlePrint} className="print-sheet-button">Imprimir</Button>
            <div id="printableArea" className="print-sheet" style={{
                width: 816 * increaseBy,
                height: 1056 * increaseBy,
            }}>
                <DraggableGrid increaseBy={increaseBy} items={gridItems} onLayoutChange={handleLayoutChange}/>
            </div>
        </div>
    );
}