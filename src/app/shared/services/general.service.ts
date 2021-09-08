import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeneralService {
    public wallpaperImages = [
        "https://vistapointe.net/images/stockholm-7.jpg",
        "https://cdn.pixabay.com/photo/2015/07/16/23/05/stockholm-848255_1280.jpg",
        "https://images.unsplash.com/photo-1542096275-2c33b1bdb375?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80",
        "https://images.unsplash.com/photo-1484037832928-afe345637f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80",
        "https://images.unsplash.com/photo-1508189860359-777d945909ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80",
        "https://images5.alphacoders.com/601/601884.jpg",
        "https://images2.alphacoders.com/734/734513.jpg",
        "https://wallpapercave.com/wp/wp2025113.jpg",
        "https://images.alphacoders.com/109/1094713.jpg",
        "https://images.alphacoders.com/485/485910.jpg",
        "/assets/img/bastien-herve--QBnKsP1P00-unsplash.jpg",
        "/assets/img/henrik_trygg-archipelago-4145.jpg",
        "/assets/img/wallpaperflare.com_wallpaper.jpg",
        "/assets/img/Stockholm_Wallpaper_Live_Stockholm_Wallpapers_CAT98_Stockholm.jpg"
    ];

    constructor() { }
}