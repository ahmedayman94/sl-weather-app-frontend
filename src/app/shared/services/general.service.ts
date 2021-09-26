import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeneralService {
    public wallpaperImages = [
        "https://images.unsplash.com/photo-1508189860359-777d945909ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80",
        "https://images2.alphacoders.com/734/734513.jpg",
        "https://images.alphacoders.com/109/1094713.jpg",
        "https://images.alphacoders.com/485/485910.jpg",
        "https://images7.alphacoders.com/457/457931.jpg",
        "./assets/img/stockholm-7.jpeg",
        "./assets/img/stockholm-sunset-bridge.jpeg",
        "./assets/img/photo-1542096275-2c33b1bdb375.jpeg",
        "./assets/img/photo-1484037832928-afe345637f55.jpeg",
        "./assets/img/bastien-herve--QBnKsP1P00-unsplash.jpg",
        "./assets/img/henrik_trygg-archipelago-4145.jpg",
        "./assets/img/wallpaperflare.com_wallpaper.jpg",
        "./assets/img/Stockholm_Wallpaper_Live_Stockholm_Wallpapers_CAT98_Stockholm.jpg",
        "./assets/img/900579.jpeg",
        "./assets/wp2025143-stockholm-wallpapers.jpeg",
        "./assets/gamla_stan.jpg"
    ];

    constructor() { }
}