import React, {useEffect, useMemo} from "react";
import "./PrintSheet.scss"
import GridLayout from 'react-grid-layout';
import DraggableGrid, {DraggableGridItem} from "../DraggableGrid/DraggableGrid";
import {Button, Spinner} from "reactstrap";
import {toPng} from "html-to-image";
import {betuelDanceShippingCardLayout, EmptyGridItem} from "../FlyerDesigner/constants/shipping-card-layouts";
import {IOrder} from "../../model/ordersModels";
import {ShippingCard} from "../ShippingCard/ShippingCard";
import {passOrderToShippingLayout} from "../../utils/order.utils";
import {extractNumbersFromText} from "../../utils/text.utils";


interface DraggableGridProps {
    orders: IOrder[];
}

export const PrintOrdersSheet = ({orders}: DraggableGridProps) => {
    const [increaseBy, setIncreaseBy] = React.useState<number>(1);
    const [printing, setPrinting] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
        // Handle layout changes here if needed
    };

    const sendToPrint = async () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
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
            setIncreaseBy(1);
            setPrinting(false);
        }
    }
    const handlePrint = async () => {
        setIncreaseBy(5);
        setLoading(true);
        setTimeout( () => {
            setPrinting(true);
        }, 1000);
    };

    useEffect(() => {
        const handle = async () => {
            setLoading(true);
            await sendToPrint()
            setLoading(false);
        }
        if (printing) {
            handle();
        }

    }, [printing, setIncreaseBy])

    const items: DraggableGridItem[] = useMemo(() => {

        return orders.map((order, i) => {
            const layout = passOrderToShippingLayout(order, betuelDanceShippingCardLayout)
            return ({
                x: Math.floor((i / 2) + 1),
                y: Math.floor((i / 2) + 1),
                w: 1,
                h: 1,
                id: `${Date.now()}-${i}`,
                layout,
                content:
                    <ShippingCard
                        layout={layout}
                    />
            })
        })
    }, [orders]);


    const gridItems: DraggableGridItem[] = useMemo(() => {
        const max = 6;
        const left = max - orders.length;
        const extra = Array.from(new Array(left)).map((p, i) => EmptyGridItem(i));
        return [...items, ...extra]
    }, [items])

    useEffect(() => {
        // const gridItems = document.querySelectorAll('.shipping-card-element');
        items.forEach(item => {
            const layout = item.layout;
            if (layout) {
                Object.keys(layout as any).forEach((key: any) => {
                    const shippingCardItem = (layout as any)[key];
                    const elem = document.getElementById(shippingCardItem.id);
                    if (elem) {
                        elem.style.fontSize = `${(extractNumbersFromText((shippingCardItem.fontSize || '0' as any)) || 16) * (increaseBy || 1)}px`;
                        elem.style.width = `${(extractNumbersFromText((shippingCardItem.width || '0' as any)) || 300) * (increaseBy || 1)}px`;
                    }
                });

            }
        });
    }, [increaseBy, items]);
    return (
        <>
            {loading &&
                <div className="loading-sale-container">
                    <Spinner animation="grow" variant="secondary"/>
                </div>
            }
            <div className="print-sheet-wrapper">
                <Button onClick={handlePrint} className="print-sheet-button text-white d-flex align-items-center gap-2 justify-content-center"  color="warning">
                    <i className="bi bi-printer" />
                    Imprimir
                </Button>
                <div id="printableArea" className="print-sheet" style={{
                    width: 816 * increaseBy,
                    height: 1056 * increaseBy,
                }}>
                    <DraggableGrid increaseBy={increaseBy} items={gridItems} onLayoutChange={handleLayoutChange}/>
                </div>
            </div>
        </>
    );
}