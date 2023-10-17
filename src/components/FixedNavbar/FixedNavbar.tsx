import "./FixedNavbar.scss"
import React from "react";

export interface IFixedNavbarProps {
    isOpen?: boolean;
    toggle?: () => void;
    children?: any;
}

export const FixedNavbar = ({isOpen, children, toggle}: IFixedNavbarProps) => {
    return (
        <div className={`fixed-navbar ${isOpen ? 'open' : ''}`}>
            <i className={`bi bi-x-lg image-handler-close ${!isOpen ? 'd-none' : ''}`} onClick={toggle}/>
            {children}
        </div>
    )
}