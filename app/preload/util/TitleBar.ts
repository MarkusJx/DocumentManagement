import {Color, Titlebar} from "custom-electron-titlebar";

export default class TitleBar {
    public static create(): void {
        new Titlebar({
            backgroundColor: Color.fromHex('#212121'),
            titleHorizontalAlignment: 'center',
            icon: null
        });
    }
}
