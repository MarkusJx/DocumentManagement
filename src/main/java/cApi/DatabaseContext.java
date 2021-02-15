package cApi;

import org.graalvm.nativeimage.c.CContext;

import java.io.File;
import java.util.Arrays;
import java.util.List;

public class DatabaseContext implements CContext.Directives {
    @Override
    public List<String> getHeaderFiles() {
        File current_dir = new File(new File("").getAbsolutePath()).getParentFile().getParentFile();

        String database_types_h_1;
        String database_types_h_2 = new File(current_dir.getPath(), "DatabaseTypes.h").getAbsolutePath();

        try {
            database_types_h_1 = new File(current_dir.getParentFile().getParentFile().getPath(), "DatabaseTypes.h").getAbsolutePath();
        } catch (Exception e) {
            database_types_h_1 = "";
        }

        return Arrays.asList(
                new IncludeFile(IncludeType.LOCAL_FILE, database_types_h_1, database_types_h_2).toString(),
                new IncludeFile(IncludeType.SYSTEM_FILE, "stdlib.h").toString()
        );
    }

    private enum IncludeType {
        LOCAL_FILE,
        SYSTEM_FILE
    }

    private static class IncludeFile {
        private String path;
        private final IncludeType type;

        IncludeFile(IncludeType type, String... paths) {
            if (paths.length == 0) {
                throw new IllegalArgumentException("At least one path must be provided");
            } else if (paths.length == 1) {
                this.path = paths[0];
            } else {
                this.path = null;
                for (String p : paths) {
                    if (new File(p).exists()) {
                        this.path = p;
                        break;
                    }
                }

                if (this.path == null) {
                    throw new RuntimeException("No valid path was found. Provided paths: " + Arrays.toString(paths));
                }
            }

            this.type = type;
        }

        @Override
        public String toString() {
            if (type == IncludeType.LOCAL_FILE) {
                return '\"' + path + '\"';
            } else {
                return '<' + path + '>';
            }
        }
    }
}
