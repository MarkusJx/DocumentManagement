import Store from "electron-store";
import {createStore, StoreType} from "../shared/Settings";
import log4js from "log4js";

const LOG_TO_CONSOLE: boolean = false;

export default function configureLogger(): void {
    const store: Store<StoreType> = createStore();
    const shouldLog = store.get('settings').logToFile;

    const appenders: string[] = [];
    if (shouldLog) {
        appenders.push("app");
    }

    if (LOG_TO_CONSOLE) {
        appenders.push("out");
    }

    // log4js requires at least one appender to work
    if (appenders.length > 0) {
        log4js.configure({
            appenders: {
                out: {
                    type: 'stdout',
                    layout: {
                        type: 'pattern',
                        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%f{2}:%l] [%p] %m'
                    }
                },
                app: {
                    type: 'file',
                    filename: 'main.log',
                    layout: {
                        type: 'pattern',
                        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%f{2}:%l] [%p] %m'
                    },
                    maxLogSize: 100000
                }
            },
            categories: {
                default: {
                    appenders: appenders,
                    level: 'info',
                    enableCallStack: true
                }
            }
        });
    } else {
        log4js.configure({
            appenders: {
                out: {
                    type: 'stdout'
                }
            },
            categories: {
                default: {
                    appenders: ['out'],
                    level: 'off'
                }
            }
        });
    }
}