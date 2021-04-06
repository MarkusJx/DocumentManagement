package io.github.markusjx.scanning;

import io.github.markusjx.database.types.Directory;
import io.github.markusjx.database.types.Document;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributeView;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedList;

/**
 * A class for scanning through file trees and discovering all files
 */
public class FileScanner {
    /**
     * Whether the host os is windows
     */
    public static final boolean IS_WINDOWS;

    static {
        String os = System.getProperty("os.name");
        if (os == null) {
            IS_WINDOWS = false;
        } else {
            IS_WINDOWS = os.startsWith("Windows");
        }
    }

    /**
     * The source file to start scanning from
     */
    private final File source;

    /**
     * The length of the (full) path to the source file
     */
    private final int sourcePathLength;

    /**
     * Create a file scanner
     *
     * @param source the directory to start scanning from
     */
    public FileScanner(String source) {
        this.source = new File(source);
        this.sourcePathLength = source.length();
    }

    /**
     * Get the create time of a file
     *
     * @param file the file
     * @return the create time as a {@link LocalDate}
     * @throws IOException if the file could not be found
     */
    private static LocalDate getCreateTime(File file) throws IOException {
        Path path = Paths.get(file.getPath());
        BasicFileAttributeView basicfile = Files.getFileAttributeView(path,
                BasicFileAttributeView.class, LinkOption.NOFOLLOW_LINKS);
        BasicFileAttributes attr = basicfile.readAttributes();
        long date = attr.creationTime().toMillis();
        Instant instant = Instant.ofEpochMilli(date);
        return LocalDate.ofInstant(instant, ZoneId.systemDefault());
    }

    /**
     * Scan through the directory tree
     *
     * @return the start directory
     */
    public Directory scan() {
        // Create the source directory
        Directory src = new Directory("", source.getName());

        // Create a stack of files to scan
        Deque<FileDirectory> toScan = new LinkedList<>();
        toScan.push(new FileDirectory(source, src));

        while (!toScan.isEmpty()) {
            // Get the current directory to work on
            FileDirectory cur = toScan.pop();

            // Get all files in this directory, if there are none, continue
            File[] files = cur.file.listFiles();
            if (files == null) continue;

            // Go through all files in the directory
            for (File f : files) {
                // If the file is a directory create a directory object
                // and add it to the files to scan
                if (f.isDirectory()) {
                    Directory dir = new Directory(getRelativePath(f), f.getName());
                    cur.directory.directories.add(dir);
                    toScan.push(new FileDirectory(f, dir));
                } else {
                    // Try creating a new document
                    try {
                        cur.directory.documents.add(new Document(f.getName(), getRelativePath(f), new ArrayList<>(0),
                                getCreateTime(f)));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }

        return src;
    }

    /**
     * Get the relative path to a file starting from the source directory
     *
     * @param src the file to get the path to
     * @return the relative path
     */
    private String getRelativePath(File src) {
        String path = src.getAbsolutePath().substring(sourcePathLength + 1);
        if (IS_WINDOWS) {
            return path.replace('\\', '/');
        } else {
            return path;
        }
    }

    /**
     * A class for storing a {@link File} and {@link Directory}
     */
    private static final class FileDirectory {
        /**
         * The actual directory in the file system
         */
        private final File file;

        /**
         * The {@link Directory} instance to persist
         */
        private final Directory directory;

        /**
         * Create a File_Directory instance from a file and a directory object
         *
         * @param file      the directory in the file system
         * @param directory the directory information object
         */
        private FileDirectory(File file, Directory directory) {
            this.file = file;
            this.directory = directory;
        }
    }
}
