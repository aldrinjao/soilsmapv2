import {icon} from 'leaflet';

export class SoilIcons {

    riceIcon = icon({
        iconUrl: './assets/ricemarker.png',
        iconSize: [45, 45],
        popupAnchor:[0, -20]
        }
    );

    biggerRiceIcon = icon({
        iconUrl: './assets/ricemarker.png',
        iconSize: [65, 65],
        popupAnchor: [0, -20]
        }
    );


    cornIcon = icon({
        iconUrl: './assets/cornmarker.png',
        iconSize: [45, 45],
        popupAnchor:[0, -20]
        }
    );

    biggerCornIcon = icon({
        iconUrl: './assets/cornmarker.png',
        iconSize: [65, 65],
        popupAnchor: [0, -20]
        }
    );

    soyIcon = icon({
        iconUrl: './assets/soybeanmarker.png',
        iconSize: [45, 45],
        popupAnchor:[0, -20]
        }
    );

    biggerSoyIcon = icon({
        iconUrl: './assets/soybeanmarker.png',
        iconSize: [65, 65],
        popupAnchor: [0, -20]
        }
    );


    sugarIcon = icon({
        iconUrl: './assets/sugarmarker.png',
        iconSize: [45, 45],
        popupAnchor:[0, -20]
        }
    );

    biggerSugarIcon = icon({
        iconUrl: './assets/sugarmarker.png',
        iconSize: [65, 65],
        popupAnchor: [0, -20]
        }
    );

    coffeeIcon = icon({
        iconUrl: './assets/coffeemarker.png',
        iconSize: [45, 45],
        popupAnchor:[0, -20]
        }
    );

    biggerCoffeeIcon = icon({
        iconUrl: './assets/coffeemarker.png',
        iconSize: [65, 65],
        popupAnchor: [0, -20]
        }
    );

    tomatoIcon = icon({
        iconUrl: './assets/tomatomarker.png',
        iconSize: [45, 45],
        popupAnchor:[0, -20]
        }
    );

    biggerTomatoIcon = icon({
        iconUrl: './assets/tomatomarker.png',
        iconSize: [65, 65],
        popupAnchor: [0, -20]
        }
    );


    coconutIcon = icon({
        iconUrl: './assets/coconutmarker.png',
        iconSize: [45, 45],
        popupAnchor:[0, -20]
        }
    );

    biggerCoconutIcon = icon({
        iconUrl: './assets/coconutmarker.png',
        iconSize: [65, 65],
        popupAnchor: [0, -20]
        }
    );

    bananaIcon = icon({
        iconUrl: './assets/bananamarker.png',
        iconSize: [45, 45],
        popupAnchor:[0, -20]
        }
    );

    biggerBananaIcon = icon({
        iconUrl: './assets/bananamarker.png',
        iconSize: [65, 65],
        popupAnchor: [0, -20]
        }
    );

    iconList = {
        Rice:{
            regular: this.riceIcon,
            big: this.biggerRiceIcon
        },
        Corn:{
            regular: this.cornIcon,
            big: this.biggerCornIcon
        },
        'Cacao/Coffee':{
            regular: this.coffeeIcon,
            big: this.biggerCoffeeIcon
        },
        Tomato:{
            regular: this.tomatoIcon,
            big: this.biggerTomatoIcon
        },
        Soybean:{
            regular: this.soyIcon,
            big: this.biggerSoyIcon
        },
        Banana:{
            regular: this.bananaIcon,
            big: this.biggerBananaIcon
        },
        Sugarcane:{
            regular: this.sugarIcon,
            big: this.biggerSugarIcon
        }


    }


}