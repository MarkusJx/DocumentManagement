import {Color, Titlebar} from "custom-electron-titlebar";

export function create(): void {
    new Titlebar({
        backgroundColor: Color.fromHex('#212121'),
        titleHorizontalAlignment: 'center',
        icon: null
    });
}