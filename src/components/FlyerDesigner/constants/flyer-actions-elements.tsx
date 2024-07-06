import {IActionContentOption, IFlyerActionProps} from "../components/FlyerAction/FlyerAction";
import React from "react";

export const fontFamilyOptions: IActionContentOption[] = [
    {
        value: 'Reey Regular',
        label: 'Reey Regular'
    },

    {
        value: 'Rockwell Extra Bold',
        label: 'Rockwell Extra Bold'
    },
    {
        value: 'Anisha',
        label: 'Anisha'
    },

    {
        value: 'Abadi MT Condensed',
        label: 'Abadi MT Condensed'
    },

    {
        value: 'Oswald',
        label: 'Oswald'
    },
    {
        value: 'Beta',
        label: 'Beta'
    },
    {
        value: 'Montserrat Bold',
        label: 'Montserrat Bold'
    },

    {
        value: 'Tondu Beta',
        label: 'Tondu Beta'
    },
    {
        value: 'Cubano',
        label: 'Cubano'
    },
]

export type FlyerActionElement = Omit<IFlyerActionProps, 'onChangeElement' | 'onReset'> & { parentProperty: string };
export const FlyerActionsElements: FlyerActionElement[] = [
    {
        parentProperty: 'fontFamily',
        tooltip: 'Tipo de Fuente',
        content: [{
            type: 'select',
            property: 'fontFamily',
            options: fontFamilyOptions,
            props: {
                placeholder: 'Tipo de letra',
            }
        }],
        elementTypes: ['text', "image"],
    },
    {
        parentProperty: 'size.fontSize',
        tooltip: 'Font Size',
        content: [{
            type: 'number',
            property: 'size.fontSize',
        }],
        elementTypes: ['text'],
    },
    {
        parentProperty: 'text.align',
        content: [{
            type: 'select',
            property: 'text.align',
            options: [
                {
                    label: 'Izquierda',
                    value: 'left',
                },
                {
                    label: 'Centrar',
                    value: 'center',
                },
                {
                    label: 'Derecha',
                    value: 'right',
                },
            ]
        }],
        elementTypes: ['text', "image"],
        toggle: <i className="bi bi-justify"/>,
        popoverHeader: 'Alineación del Texto',
    },
    {
        parentProperty: 'color.background',
        content: [{
            type: 'color',
            property: 'color.background',
        }],
        toggle: <i className="bi bi-paint-bucket"/>,
        popoverHeader: 'Color de Fondo',
        elementTypes: ['text', "image"],
    },
    {
        parentProperty: 'color.text',
        content: [{
            type: 'color',
            property: 'color.text',
        }],
        toggle: <i className="bi bi-fonts"></i>,
        popoverHeader: 'Color de Letra',
        elementTypes: ['text', "image"],
    },
    {
        parentProperty: 'opacity',
        content: [{
            type: 'number',
            property: 'opacity',
            props: {
                min: 0,
                max: 1,
                step: 0.1,
            }
        }],
        elementTypes: ['text', "image"],
        toggle: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                     className="bi bi-transparency" viewBox="0 0 16 16">
            <path
                d="M0 6.5a6.5 6.5 0 0 1 12.346-2.846 6.5 6.5 0 1 1-8.691 8.691A6.5 6.5 0 0 1 0 6.5Zm5.144 6.358a5.5 5.5 0 1 0 7.714-7.714 6.5 6.5 0 0 1-7.714 7.714Zm-.733-1.269c.363.15.746.261 1.144.33l-1.474-1.474c.069.398.18.78.33 1.144Zm2.614.386a5.47 5.47 0 0 0 1.173-.242L4.374 7.91a5.958 5.958 0 0 0-.296 1.118l2.947 2.947Zm2.157-.672c.297-.166.577-.36.838-.576L5.418 6.126a6.016 6.016 0 0 0-.587.826l4.35 4.351Zm1.545-1.284c.216-.26.41-.54.576-.837L6.953 4.83a5.97 5.97 0 0 0-.827.587l4.6 4.602Zm1.006-1.822c.121-.374.204-.766.242-1.172L9.028 4.078c-.386.063-.76.163-1.118.296l3.823 3.824Zm.186-2.642a5.463 5.463 0 0 0-.33-1.144 5.46 5.46 0 0 0-1.144-.33l1.474 1.474Z"/>
        </svg>,
        popoverHeader: 'Opacidad',
    },
    {
        parentProperty: 'padding',
        tooltip: 'Espaciado interior',
        content: [{
            type: 'number',
            property: 'padding',
        }],
        elementTypes: ['text', 'image'],
        toggle: <i className="bi bi-dpad"/>,
        popoverHeader: 'Espaciado Interior',
    },
    {
        parentProperty: 'text.letterSpacing',
        tooltip: 'Espaciado entre letras',
        content: [{
            type: 'number',
            property: 'text.letterSpacing',
        }],
        elementTypes: ['text'],
        toggle: <i className="bi bi-distribute-horizontal"/>,
        popoverHeader: 'Espaciado entre letras',
    },

    {
        parentProperty: 'border',
        content: [
            {
                label: 'Estilo del borde',
                type: 'select',
                property: 'border.style',
                options: [
                    {
                        value: 'solid',
                        label: 'Lineal'
                    },
                    {
                        value: 'dashed',
                        label: 'Guiones'
                    },
                    {
                        value: 'dotted',
                        label: 'Puntos'
                    },
                ]
            },
            {
                label: 'Tamaño',
                type: 'number',
                property: 'border.width',
            },
            {
                label: 'Redondez',
                type: 'number',
                property: 'border.radius',
            },
            {
                label: 'Color',
                type: 'color',
                property: 'border.color',
            }
        ],
        toggle: <i className="bi bi-square cursor-pointer"/>,
        popoverHeader: 'Bordes',
        elementTypes: ['text', "image"],
    },
    {
        parentProperty: 'stroke',
        content: [
            {
                label: 'Tamaño',
                type: 'number',
                property: 'stroke.width',
            },
            {
                label: 'Color',
                type: 'color',
                property: 'stroke.color',
            },
            {
                label: 'Colocar Trazado por dentro',
                type: 'switch',
                property: 'stroke.inside',
            },
        ],
        toggle: <i className="bi bi-border-width cursor-pointer"/>,
        popoverHeader: 'Bordes de Letra',
        elementTypes: ['text'],
    },
    {
        parentProperty: 'shadow',
        content: [
            {
                label: 'Espaciado Horizontal',
                type: 'number',
                property: 'shadow.vertical',
                props: {
                    min: 0
                },
            },
            {
                label: 'Espaciado Vertical',
                type: 'number',
                property: 'shadow.horizontal',
                props: {
                    min: 0
                },
            },
            {
                label: 'Difuminacion',
                type: 'number',
                property: 'shadow.blur',
                props: {
                    min: 0
                },
            },
            {
                label: 'Color',
                type: 'color',
                property: 'shadow.color',
            },
        ],
        toggle: <i className="bi bi-back"/>,
        popoverHeader: 'Sombra',
        elementTypes: ['text', 'image'],
    },
    {
        parentProperty: 'textShadow',
        content: [
            {
                label: 'Espaciado Horizontal',
                type: 'number',
                property: 'textShadow.vertical',
            },
            {
                label: 'Espaciado Vertical',
                type: 'number',
                property: 'textShadow.horizontal',
            },
            {
                label: 'Difuminacion',
                type: 'number',
                property: 'textShadow.blur',
                props: {
                    min: 0
                },
            },
            {
                label: 'Color',
                type: 'color',
                property: 'textShadow.color',
            },
        ],
        toggle: <i className="bi bi-file-font"/>,
        popoverHeader: 'Sombra de Letra',
        elementTypes: ['text'],
    },
    {
        parentProperty: 'transform',
        content: [
            {
                label: 'Grados de rotacion',
                type: 'number',
                property: 'transform.rotation',

            },
            {
                label: 'Deformacion de horizontal',
                type: 'number',
                property: 'transform.skew.x',
            },
            {
                label: 'Deformacion de vertical',
                type: 'number',
                property: 'transform.skew.y',
            },
        ],
        toggle: <i className="bi bi-bezier2 "/>,
        popoverHeader: 'Transformar',
        elementTypes: ['text', 'image'],
    },

]