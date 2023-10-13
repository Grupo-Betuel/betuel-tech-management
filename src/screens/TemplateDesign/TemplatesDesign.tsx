import React from "react";
import FlyerDesigner from "../../components/FlyerDesigner/FlyerDesigner";

export const TemplatesDesign = () => {
    return (
        <div className="w-100 d-flex justify-content-center align-items-center flex-column"
             style={{width: "100dvw", height: "100dvh"}}>
            <FlyerDesigner />
        </div>
    )
}
