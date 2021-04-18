package io.github.markusjx.util;

import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.FileAppender;
import org.apache.log4j.Level;
import org.apache.log4j.PatternLayout;

/**
 * A class for configuring the logger
 */
@SuppressWarnings("unused")
public final class Logging {
    /**
     * Don't.
     */
    private Logging() {
    }

    /**
     * Configure the logger
     *
     * @param logToConsole whether to log to the console
     * @param logToFile    whether to log to the file
     */
    public static void configureLogger(boolean logToConsole, boolean logToFile) {
        try {
            final Level level = Level.INFO;
            final String pattern = "[%d{yyyy-MM-dd HH:mm:ss}] [%c#%M:%L] [%p] %m%n";

            // Remove all appenders
            org.apache.log4j.Logger.getRootLogger().removeAllAppenders();

            if (logToConsole) {
                // Create the console appender
                ConsoleAppender console = new ConsoleAppender();
                console.setName("stdout");
                console.setLayout(new PatternLayout(pattern));
                console.setThreshold(level);
                console.activateOptions();

                // Add appender to the root logger
                org.apache.log4j.Logger.getRootLogger().addAppender(console);
            }

            // Create the file appender if logToFile is true
            if (logToFile) {
                FileAppender fa = new FileAppender();
                fa.setName("file");
                fa.setFile("backend.log");
                fa.setLayout(new PatternLayout(pattern));
                fa.setThreshold(level);
                fa.setAppend(true);
                fa.activateOptions();

                //add appender to any Logger (here is root)
                org.apache.log4j.Logger.getRootLogger().addAppender(fa);
            }

            if (!logToConsole && !logToFile) {
                org.apache.log4j.Logger.getRootLogger().setLevel(Level.OFF);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
