package io.github.markusjx.scanning;

import io.github.markusjx.database.databaseTypes.Document;
import io.github.markusjx.database.databaseTypes.Tag;

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
import java.util.Collections;
import java.util.List;

public class FileScanner {
    private final File source;

    public FileScanner(String source) {
        this.source = new File(source);
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

    public List<Document> scan() {
        return scan(source);
    }

    private List<Document> scan(File src) {
        File[] files = src.listFiles();
        if (files != null) {
            List<Document> res = new ArrayList<>();
            for (File f : files) {
                res.addAll(scan(f));
            }

            return res;
        } else {
            try {
                return Collections.singletonList(new Document(src.getName(), src.getAbsolutePath(),
                        new ArrayList<>(0), getCreateTime(src), new Tag("ab")));
            } catch (Exception ignored) {
                return new ArrayList<>(0);
            }
        }
    }
}
