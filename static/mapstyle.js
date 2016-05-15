var MAPSTYLES = [
{
    "featureType": "administrative",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },
    {
        "featureType": "landscape",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "color": "#000000"
            },
            {
                "weight": 0.1
            }
        ]
    },
    // {
    //     "featureType": "administrative",
    //     "stylers": [
    //         {
    //             "visibility": "on"
    //         },
    //         {
    //             "hue": "#ff0000"
    //         },
    //         {
    //             "weight": 0.4
    //         },
    //         {
    //             "color": "#ffffff"
    //         }
    //     ]
    // },
    {
        "featureType": "road.highway",
        "elementType": "labels.text",
        "stylers": [
            {
                "weight": 1.3
            },
            {
                // "color": "#FFFFFF"
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#B52127"
            },
            {
                "weight": 3
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#B52127"
            },
            {
                "weight": 1.1
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#B52127"
            },
            {
                "weight": 0.4
            }
        ]
    },
    {},
    {
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [
            {
                "weight": 0.8
            },
            {
                "color": "#ffffff"
            },
            {
                "visibility": "off"
                // "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "off",
                // "weight": 0.7
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                // "visibility": "off"
                "color": "#E6AB16"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "color": "#00a9ca"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "stylers": [
            {
                "visibility": "off"
                // "visibility": "on"
            }
        ]
    }
]






// [
//     {
//         "featureType": "all",
//         "elementType": "all",
//         "stylers": [
//             {
//                 "hue": "#ff0000"
//             },
//             {
//                 "saturation": -100
//             },
//             {
//                 "lightness": -30
//             }
//         ]
//     },
//     {
//         "featureType": "all",
//         "elementType": "labels.text.fill",
//         "stylers": [
//             {
//                 "color": "#ffffff"
//             }
//         ]
//     },
//     {
//         "featureType": "all",
//         "elementType": "labels.text.stroke",
//         "stylers": [
//             {
//                 "color": "#353535"
//             }
//         ]
//     },
//     {
//         "featureType": "administrative",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "visibility": "off"
//             }
//         ]
//     },
//     {
//         "featureType": "administrative.country",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "visibility": "off"
//             }
//         ]
//     },
//     {
//         "featureType": "administrative.province",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "visibility": "off"
//             }
//         ]
//     },
//     {
//         "featureType": "administrative.locality",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "visibility": "off"
//             }
//         ]
//     },
//     {
//         "featureType": "administrative.neighborhood",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "visibility": "off"
//             }
//         ]
//     },
//     {
//         "featureType": "landscape",
//         "elementType": "geometry",
//         "stylers": [
//             {
//                 "color": "#656565"
//             }
//         ]
//     },
//     {
//         "featureType": "landscape",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "visibility": "off"
//             }
//         ]
//     },
//     {
//         "featureType": "poi",
//         "elementType": "geometry.fill",
//         "stylers": [
//             {
//                 "color": "#505050"
//             }
//         ]
//     },
//     {
//         "featureType": "poi",
//         "elementType": "geometry.stroke",
//         "stylers": [
//             {
//                 "color": "#808080"
//             }
//         ]
//     },
//     {
//         "featureType": "poi",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "visibility": "off"
//             }
//         ]
//     },
//     {
//         "featureType": "road",
//         "elementType": "geometry",
//         "stylers": [
//             {
//                 "color": "#454545"
//             }
//         ]
//     },
//     {
//         "featureType": "road",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "visibility": "off"
//             }
//         ]
//     },
//     {
//         "featureType": "transit",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "hue": "#000000"
//             },
//             {
//                 "saturation": 100
//             },
//             {
//                 "lightness": -40
//             },
//             {
//                 "invert_lightness": true
//             },
//             {
//                 "gamma": 1.5
//             },
//             {
//                 "visibility": "off"
//             }
//         ]
//     },
//     {
//         "featureType": "water",
//         "elementType": "labels",
//         "stylers": [
//             {
//                 "visibility": "off"
//             }
//         ]
//     }
// ];

