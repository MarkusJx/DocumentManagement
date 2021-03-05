package io.github.markusjx.scanning;

import io.github.markusjx.database.databaseTypes.Directory;
import io.github.markusjx.database.databaseTypes.Document;

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
import java.util.Stack;

public class FileScanner {
    public static final boolean isWindows;

    static {
        String os = System.getProperty("os.name");
        if (os == null) {
            isWindows = false;
        } else {
            isWindows = os.startsWith("Windows");
        }
    }

    private final File source;
    private final int sourcePathLength;

    public FileScanner(String source) {
        this.source = new File(source);
        this.sourcePathLength = source.length();
    }

    private static LocalDate getCreateTime(File file) throws IOException {
        Path path = Paths.get(file.getPath());
        BasicFileAttributeView basicfile = Files.getFileAttributeView(path,
                BasicFileAttributeView.class, LinkOption.NOFOLLOW_LINKS);
        BasicFileAttributes attr = basicfile.readAttributes();
        long date = attr.creationTime().toMillis();
        Instant instant = Instant.ofEpochMilli(date);
        return LocalDate.ofInstant(instant, ZoneId.systemDefault());
    }

    public Directory scan() {
        Directory src = new Directory("", source.getName());
        Stack<File_Directory> toScan = new Stack<>();
        toScan.push(new File_Directory(source, src));

        while (!toScan.isEmpty()) {
            File_Directory cur = toScan.pop();
            File[] files = cur.file.listFiles();
            if (files == null) continue;
            for (File f : files) {
                if (f.isDirectory()) {
                    Directory dir = new Directory(getAbsolutePath(f), f.getName());
                    cur.directory.directories.add(dir);
                    toScan.push(new File_Directory(f, dir));
                } else {
                    try {
                        cur.directory.documents.add(new Document(f.getName(), getAbsolutePath(f), new ArrayList<>(0),
                                getCreateTime(f)));
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        return src;
    }

    private String getAbsolutePath(File src) {
        String path = src.getAbsolutePath().substring(sourcePathLength + 1);
        if (isWindows) {
            return path.replace('\\', '/');
        } else {
            return path;
        }
    }

    private static final class File_Directory {
        private final File file;
        private final Directory directory;

        private File_Directory(File file, Directory directory) {
            this.file = file;
            this.directory = directory;
        }
    }

    /*private Directory scan(File src) {
        File[] files = src.listFiles();
        Directory res = new Directory(getAbsolutePath(src));
        if (files != null) {
            for (File f : files) {
                res.addAll(scan(f));
            }

            return res;
        } else {
            try {
                return Collections.singletonList(new Document(src.getName(), getAbsolutePath(src),
                        new ArrayList<>(0), getCreateTime(src)));
            } catch (Exception ignored) {
                return new ArrayList<>(0);
            }
        }
    }*/
}
