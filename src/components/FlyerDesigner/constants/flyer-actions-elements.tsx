import {IActionContentOption, IFlyerActionProps} from "../components/FlyerAction";
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

export type FlyerActionElement = Omit<IFlyerActionProps, 'onChangeElement' | 'onReset'>;
export const FlyerActionsElements: FlyerActionElement[] = [
    {
        tooltip: 'Font Size',
        content: [{
            type: 'number',
            property: 'size.fontSize',
        }],
        elementTypes: ['text'],
    },
    {
        content: [{
            type: 'number',
            property: 'padding',
        }],
        elementTypes: ['text', 'image'],
        toggle: <i className="bi bi-paint-bucket"/>,
        popoverHeader: 'Espaciado Interior',
    },
    {
        content: [{
            type: 'number',
            property: 'text.letterSpacing',
        }],
        elementTypes: ['text'],
        toggle: <i className="bi bi-paint-bucket"/>,
        popoverHeader: 'Espaciado Entre letras',
    },
    {
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
        toggle: <i className="bi bi-paint-bucket"/>,
        popoverHeader: 'Opacidad',
    },
    {
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
        toggle: <i className="bi bi-paint-bucket"/>,
        popoverHeader: 'Alineación de Texto',
    },

    {
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
        content: [{
            type: 'color',
            property: 'color.background',
        }],
        toggle: <i className="bi bi-paint-bucket"/>,
        popoverHeader: 'Color de Fondo',
        elementTypes: ['text', "image"],
    },
    {
        content: [{
            type: 'color',
            property: 'color.text',
        }],
        toggle: <i className="bi bi-fonts"></i>,
        popoverHeader: 'Color de Letra',
        elementTypes: ['text', "image"],
    },
    {
        content: [
            {
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
                type: 'number',
                property: 'border.width',
            },
            {
                type: 'number',
                property: 'border.radius',
            },
            {
                type: 'color',
                property: 'border.color',
            }
        ],
        toggle: <i className="bi bi-square cursor-pointer"/>,
        popoverHeader: 'Bordes',
        elementTypes: ['text', "image"],
    },
    {
        content: [
            {
                type: 'number',
                property: 'stroke.width',
            },
            {
                type: 'color',
                property: 'stroke.color',
            },
            {
                type: 'switch',
                property: 'stroke.inside',
            },
        ],
        toggle: <i className="bi bi-border-width cursor-pointer"/>,
        popoverHeader: 'Bordes de Letra',
        elementTypes: ['text'],
    },
    {
        content: [
            {
                type: 'number',
                property: 'shadow.vertical',
                props: {
                    min: 0
                },
            },
            {
                type: 'number',
                property: 'shadow.horizontal',
                props: {
                    min: 0
                },
            },
            {
                type: 'number',
                property: 'shadow.blur',
                props: {
                    min: 0
                },
            },
            {
                type: 'color',
                property: 'shadow.color',
            },
        ],
        toggle: <i className="bi bi-back"/>,
        popoverHeader: 'Sombra',
        elementTypes: ['text', 'image'],
    },
    {
        content: [
            {
                type: 'number',
                property: 'textShadow.vertical',
                props: {
                    min: 0
                },
            },
            {
                type: 'number',
                property: 'textShadow.horizontal',
                props: {
                    min: 0
                },
            },
            {
                type: 'number',
                property: 'textShadow.blur',
                props: {
                    min: 0
                },
            },
            {
                type: 'color',
                property: 'textShadow.color',
            },
        ],
        toggle: <i className="bi bi-file-font"/>,
        popoverHeader: 'Sombra de Letra',
        elementTypes: ['text'],
    },
    {
        content: [
            {
                type: 'number',
                property: 'transform.rotation',

            },
            {
                type: 'number',
                property: 'transform.skew.x',
            },
            {
                type: 'number',
                property: 'transform.skew.y',
            },
        ],
        toggle: <i className="bi bi-bezier2 "/>,
        popoverHeader: 'Transformar',
        elementTypes: ['text'],
    },

]