import React from "react";
import "./Card.scss";
export const Card = () => {
    return (
        <div className="card-item">
            <div className="card-item-content">
                <img className="card-item-wallpaper" src="https://picsum.photos/200/300" alt="Imagem" />
                <div className="card-item-title">Titulo</div>
            </div>
        </div>
    )
}

export const CardGrid = () => {
    return (
    <div className="card-grid">
        <Card />
        <Card />
        <Card />
        <Card />
    </div>
    )
}
